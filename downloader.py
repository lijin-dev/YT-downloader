import os
import sys
from yt_dlp import YoutubeDL

# Try utilizing the cloud-native static package wrapper structure
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
    ffmpeg_path = None # System paths automatically mapped
except ImportError:
    # Local fallback option if package not loaded locally
    try:
        import imageio_ffmpeg
        ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        ffmpeg_path = None

def download_hd_video(video_url):
    output_folder = './downloads'
    
    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'merge_output_format': 'mp4',
        'outtmpl': os.path.join(output_folder, '%(title)s.%(ext)s'),
    }
    
    # If using local absolute file path assignment mappings
    if ffmpeg_path:
        ydl_opts['ffmpeg_location'] = ffmpeg_path
        
    try:
        print("\nProcessing streams and downloading the highest quality file...")
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        print("\nHigh-Quality Download completed successfully!")
        print(f"Check the downloads folder in your sidebar.")
    except Exception as e:
        print(f"\nAn error occurred during download: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        download_hd_video(url)
    else:
        print("========================================")
        print("   PYTHON HIGH-QUALITY YT DOWNLOADER   ")
        print("========================================")
        url = input("Enter YouTube HD Video URL: ")
        if url.strip():
            download_hd_video(url)
        else:
            print("URL cannot be empty.")
