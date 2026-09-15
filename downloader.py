import os
import sys
from yt_dlp import YoutubeDL

try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
    ffmpeg_path = None
except ImportError:
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
        # 🔒 ADVANCED BYPASS: Use OAuth authentication to verify the server identity
        'username': 'oauth2',
        'password': '', 
        'extractor_args': {
            'youtube': {
                'player_client': ['ios', 'android'],
            }
        }
    }
    
    if ffmpeg_path:
        ydl_opts['ffmpeg_location'] = ffmpeg_path
        
    try:
        print("\nProcessing streams and downloading the highest quality file...")
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        print("\nHigh-Quality Download completed successfully!")
    except Exception as e:
        print(f"\nAn error occurred during download: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        download_hd_video(url)
    else:
        url = input("Enter YouTube HD Video URL: ")
        if url.strip():
            download_hd_video(url)
