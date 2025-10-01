import requests
import os

# --- Helper & Core Functions (from previous client) ---

def handle_response(response):
    """Checks for HTTP errors and prints the response."""
    try:
        response.raise_for_status()
        try:
            print("\n[SUCCESS]") # Green text for success
            print(response.json())
        except requests.exceptions.JSONDecodeError:
            print("\n[SUCCESS]")
            print(f"Received non-JSON response. Content-Type: {response.headers.get('Content-Type')}")
    except requests.exceptions.HTTPError as e:
        print(f"\n[ERROR] HTTP Error: {e}") # Red text for error
        print(f"Response Body: {response.text}")

def test_vqa(base_url, image_path, question):
    if not os.path.exists(image_path):
        print(f"\n[ERROR] Image file not found at: {image_path}")
        return
    url = f"{base_url}/vqa/"
    print(f"\nSending VQA request to {url}...")
    with open(image_path, 'rb') as f:
        files = {'image_file': (os.path.basename(image_path), f, 'image/jpeg')}
        data = {'question': question}
        try:
            response = requests.post(url, files=files, data=data, timeout=60)
            handle_response(response)
        except requests.exceptions.RequestException as e:
            print(f"\n[ERROR] Request failed: {e}")

def create_tts_profile(base_url, account_id, profile_name, audio_path):
    if not os.path.exists(audio_path):
        print(f"\n[ERROR] Audio file not found at: {audio_path}")
        return
    url = f"{base_url}/tts/voice-profiles"
    print(f"\nCreating new voice profile at {url}...")
    with open(audio_path, 'rb') as f:
        files = {'audio_file': (os.path.basename(audio_path), f, 'audio/wav')}
        data = {'account_id': account_id, 'profile_name': profile_name}
        try:
            response = requests.post(url, files=files, data=data, timeout=60)
            handle_response(response)
        except requests.exceptions.RequestException as e:
            print(f"\n[ERROR] Request failed: {e}")

def generate_tts(base_url, profile_id, text, output_file):
    url = f"{base_url}/tts/generate"
    print(f"\nRequesting TTS generation from {url}...")
    json_payload = {'profile_id': profile_id, 'text': text, 'language': 'ko'}
    try:
        response = requests.post(url, json=json_payload, timeout=120, stream=True)
        if response.status_code == 200 and response.headers.get('Content-Type') == 'audio/wav':
            with open(output_file, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"\n[SUCCESS] TTS audio saved to: {output_file}")
        else:
            handle_response(response)
    except requests.exceptions.RequestException as e:
        print(f"\n[ERROR] Request failed: {e}")

# --- Interactive Handlers ---

def vqa_interactive_handler(base_url):
    print("--- VQA Test ---")
    image_path = input("Enter the path to the image file: ")
    question = input("Enter the question about the image: ")
    test_vqa(base_url, image_path, question)

def tts_interactive_handler(base_url):
    while True:
        print("\n--- TTS Test Menu ---")
        print("1. Create a new voice profile")
        print("2. Generate speech from a profile")
        print("3. Back to main menu")
        choice = input("Select an option: ")

        if choice == '1':
            print("\n-> Create a new voice profile")
            account_id = input("Enter Account ID (e.g., family01): ")
            profile_name = input("Enter a name for the new profile (e.g., my_profile): ")
            audio_path = input("Enter the path to the .wav file for cloning: ")
            create_tts_profile(base_url, account_id, profile_name, audio_path)
        elif choice == '2':
            print("\n-> Generate speech")
            profile_id = input("Enter the profile_id to use (e.g., vp_xxxxxxxx): ")
            text = input("Enter the text to synthesize: ")
            output_file = input("Enter the output filename (e.g., tts_output.wav): ")
            if not output_file:
                output_file = "tts_output.wav"
            generate_tts(base_url, profile_id, text, output_file)
        elif choice == '3':
            break
        else:
            print("\nInvalid option, please try again.")

# --- Main Loop ---

def main():
    host = "localhost"
    port = 8000

    print("--- Welcome to the Unified AI Server Interactive Client ---")

    while True:
        base_url = f"http://{host}:{port}"
        print("\n========================================================")
        print(f"Current Server URL: {base_url}")
        print("========================================================")
        print("Select a function to test:")
        print("1. VQA (Visual Question Answering)")
        print("2. TTS (Text-to-Speech)")
        print("3. Change Server URL")
        print("4. Exit")
        
        main_choice = input("Enter your choice (1-4): ")

        if main_choice == '1':
            vqa_interactive_handler(base_url)
        elif main_choice == '2':
            tts_interactive_handler(base_url)
        elif main_choice == '3':
            try:
                new_host = input(f"Enter new host (current: {host}): ")
                new_port = input(f"Enter new port (current: {port}): ")
                host = new_host if new_host else host
                port = int(new_port) if new_port else port
                print(f"Server URL updated to: http://{host}:{port}")
            except ValueError:
                print("\n[ERROR] Invalid port. Please enter a number.")
        elif main_choice == '4':
            print("Exiting client. Goodbye!")
            break
        else:
            print("\nInvalid option. Please enter a number between 1 and 4.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nClient interrupted. Exiting...")
        exit(0)