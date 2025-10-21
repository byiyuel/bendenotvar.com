#!/usr/bin/env python3
"""
YouTube playlist video downloader (high quality) using yt-dlp.

Usage (Windows PowerShell):
  python tools/youtube_playlist_downloader.py "<PLAYLIST_URL>" --output "downloads" --max-height 2160

Requires:
  - Python 3.8+
  - pip install -r tools/requirements.txt
  - FFmpeg available on PATH (for merging bestvideo+bestaudio into mp4)
"""

import argparse
import os
import sys
from typing import Dict, Any


def build_format_string(max_height: int) -> str:
    """Return a yt-dlp format selector string for high quality mp4 output.

    Strategy:
    - Prefer best video up to max_height in mp4 + best m4a audio, then fallback to best.
    - If mp4 streams aren't available, fallback gracefully to any best combination.
    """
    return (
        f"bestvideo[height<={max_height}][ext=mp4]+bestaudio[ext=m4a]/"
        f"bestvideo[height<={max_height}]+bestaudio/"
        f"best[ext=mp4]/best"
    )


def human_readable_size(bytes_count: float) -> str:
    if bytes_count is None:
        return "?"
    units = ["B", "KB", "MB", "GB", "TB"]
    size = float(bytes_count)
    unit_idx = 0
    while size >= 1024 and unit_idx < len(units) - 1:
        size /= 1024.0
        unit_idx += 1
    return f"{size:.2f} {units[unit_idx]}"


def make_progress_hook() -> Any:
    def hook(d: Dict[str, Any]) -> None:
        status = d.get("status")
        if status == "downloading":
            total_bytes = d.get("total_bytes") or d.get("total_bytes_estimate")
            downloaded = d.get("downloaded_bytes", 0)
            speed = d.get("speed")
            eta = d.get("eta")
            percent = 0.0
            if total_bytes:
                percent = downloaded / total_bytes * 100.0
            parts = [
                f"{percent:6.2f}%",
                f"{human_readable_size(downloaded)}/{human_readable_size(total_bytes)}",
            ]
            if speed:
                parts.append(f"@ {human_readable_size(speed)}/s")
            if eta:
                parts.append(f"ETA {eta}s")
            print("[DL] ", " ".join(parts), end="\r", flush=True)
        elif status == "finished":
            filename = d.get("filename") or "file"
            print(f"\n[MERGE] Post-processing '{filename}' ...")
    return hook


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download a YouTube playlist as high-quality video files (mp4) using yt-dlp."
    )
    parser.add_argument(
        "url",
        help="YouTube playlist URL (video URLs also supported)",
    )
    parser.add_argument(
        "--output",
        default=os.path.join("downloads"),
        help="Output directory (default: downloads)",
    )
    parser.add_argument(
        "--max-height",
        type=int,
        default=2160,
        help="Maximum video height to download (e.g., 2160, 1440, 1080, 720). Default: 2160",
    )
    parser.add_argument(
        "--rate-limit",
        default=None,
        help="Rate limit (e.g., 5M, 1M, 500K). Optional.",
    )
    parser.add_argument(
        "--subtitles",
        action="store_true",
        help="Download available subtitles and embed if possible.",
    )
    parser.add_argument(
        "--ffmpeg",
        default=None,
        help="Optional path to ffmpeg/ffprobe directory or binary.",
    )
    return parser.parse_args()


def ensure_dirs(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def main() -> int:
    try:
        import yt_dlp  # type: ignore
    except ImportError:
        print("Error: 'yt-dlp' is not installed. Run: pip install -r tools/requirements.txt", file=sys.stderr)
        return 1

    args = parse_args()
    ensure_dirs(args.output)

    out_template = os.path.join(
        args.output,
        "%(playlist_title|Unknown Playlist)s",
        "%(playlist_index|000)03d - %(title)s [%(id)s].%(ext)s",
    )

    format_selector = build_format_string(args.max_height)

    ydl_opts: Dict[str, Any] = {
        # Formats and output
        "format": format_selector,
        "merge_output_format": "mp4",
        "outtmpl": out_template,
        "restrictfilenames": True,
        # Playlist behavior
        "noplaylist": False,  # allow whole playlists
        # Reliability and resumes
        "ignoreerrors": True,
        "continuedl": True,
        "concurrent_fragment_downloads": 4,
        # Console
        "progress_hooks": [make_progress_hook()],
    }

    if args.rate_limit:
        ydl_opts["ratelimit"] = args.rate_limit

    if args.subtitles:
        ydl_opts.update(
            {
                "writesubtitles": True,
                "writeautomaticsub": True,
                "subtitleslangs": ["tr", "en", ""],  # prefer Turkish, then English, else any
                "postprocessors": [
                    {"key": "FFmpegMetadata"},
                    {"key": "FFmpegVideoRemuxer", "preferedformat": "mp4"},
                    {"key": "EmbedSubtitle"},
                ],
            }
        )
    else:
        ydl_opts.update(
            {
                "postprocessors": [
                    {"key": "FFmpegMetadata"},
                    {"key": "FFmpegVideoRemuxer", "preferedformat": "mp4"},
                ]
            }
        )

    if args.ffmpeg:
        ydl_opts["ffmpeg_location"] = args.ffmpeg

    print("Starting download with options:\n" f"- Output: {args.output}\n" f"- Max height: {args.max_height}\n")

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([args.url])
    except KeyboardInterrupt:
        print("\nInterrupted by user.")
        return 130
    except Exception as exc:  # noqa: BLE001 - surface any yt-dlp/ffmpeg issues clearly
        print(f"\nDownload failed: {exc}", file=sys.stderr)
        return 1

    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())





