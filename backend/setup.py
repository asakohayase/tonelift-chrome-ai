from setuptools import setup, find_packages

setup(
    name="ai-positivity-transformer",
    packages=find_packages(),    # Find all Python packages
    install_requires=[           # List dependencies
        "fastapi",
        "uvicorn",
        "python-multipart",
        "python-dotenv",
        "openai",
        "requests"
    ],
)