import os
import glob
import docx
import pdfplumber
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


# 1. Read DOCX
def read_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])


# 1b. Read PDF
def read_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


# 2. Connect to GitHub Models API
client = OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=os.environ["GITHUB_TOKEN"]
)

def categorize_text(text_chunk):
    # 3. Request categorization
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "Categorize the text into exactly ONE of these categories: ['Prävention von Extremismus', 'Gesundheit', \"Kinder, Jugendliche und Elternarbeit\", 'Arbeitsmarkt', 'Frauen', 'Deutsch', 'Gemeinde und Identität']. Reply with ONLY the category name."
            },
            {
                "role": "user",
                "content": text_chunk[:15000]
            }
        ],
        temperature=0.0
    )
    return response.choices[0].message.content.strip()

if __name__ == "__main__":
    # Find both docx and pdf files
    docx_files = glob.glob("Hackathon/**/*.docx", recursive=True)
    pdf_files = glob.glob("Hackathon/**/*.pdf", recursive=True)
    files = docx_files + pdf_files

    for file_path in files:
        if "projektbeschreibung" in file_path.lower():
            print(f"Processing {file_path}...")
            try:
                if file_path.lower().endswith(".docx"):
                    text = read_docx(file_path)
                elif file_path.lower().endswith(".pdf"):
                    text = read_pdf(file_path)
                else:
                    continue

                category = categorize_text(text)
                print(f"File: {file_path}")
                print(f"Category: {category}")
                print("-" * 20)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

