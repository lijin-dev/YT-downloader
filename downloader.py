import os
import sys
import imageio_ffmpeg
from yt_dlp import YoutubeDL

def download_hd_video(video_url):
    output_folder = './downloads'
    
    # Get the location of the portable FFmpeg we just installed
    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
    
    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'merge_output_format': 'mp4',
        'outtmpl': os.path.join(output_folder, '%(title)s.%(ext)s'),
        'ffmpeg_location': ffmpeg_path,  # Tells Python exactly where FFmpeg is hidden!
    }
    
    try:
        # FIXED: Removed the emoji characters to prevent Windows encoding crashes
        print("\nProcessing streams and downloading the highest quality file...")
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        print("\nHigh-Quality Download completed successfully!")
        print(f"Check the downloads folder in your sidebar.")
    except Exception as e:
        # FIXED: Removed the error emoji here too
        print(f"\nAn error occurred during download: {e}")

# This handles running the script from either the console or your Node.js server
if __name__ == "__main__":
    # Check if a URL was passed directly from our web server command line
    if len(sys.argv) > 1:
        url = sys.argv[1]  # Correctly grabs the URL string from Node.js
        download_hd_video(url)
    else:
        # Fallback for manual testing if you just run 'python downloader.py' in terminal
        print("========================================")
        print("   PYTHON HIGH-QUALITY YT DOWNLOADER   ")
        print("========================================")
        url = input("Enter YouTube HD Video URL: ")
        if url.strip():
            download_hd_video(url)
        else:
            print("URL cannot be empty.")
