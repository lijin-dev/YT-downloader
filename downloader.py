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
        # ⚡ BYPASS BOT DETECTION CONFIGURATION PARAMETERS
        'extractor_args': {
            'youtube': {
                # Force yt-dlp to request streams using alternative secure web API endpoints
                'player_client': ['web_safari', 'ios', 'android'],
                'skip': ['webpage', 'configs']
            }
        },
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Mode': 'navigate'
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
