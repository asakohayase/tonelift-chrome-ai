<a id="readme-top"></a>
<h1> ToneLift AI </h1>

<div align="left">
  <p>
  ToneLift AI is a web application designed to enhance the tone of your messages. It uses advanced language models to transform your text into a more empathetic, professional, or customer-friendly tone, depending on the specified context.
</div>




<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#features">Features</a> </li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## Features
* Contextual Adaptation: Adjust tone based on different situations (e.g., client communication, personal messages).
* Empathetic and Constructive Feedback: Automatically suggest improvements.
* Voice Input: Use voice-to-text to input your message.
<br />
<br />




## Built With

* Frontend - Next.js, Typescript and Tailwind CSS
* Backend - Python and Fast API
* AI Integration - NVIDIA NGC model
* Deployment - Docker, Docker Compose

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git
- Node.js (for local development)

### Installation

1. Clone the repository and navigate to the directory:
```bash
git clone https://github.com/asakohayase/tonelift-ai.git
cd Lifestoryteller
```

2. Create `.env.frontend`:
```env
NGC_API_KEY=your_ngc_api_key
NGC_ORG_ID=your_ngc_org_id
NGC_MODEL_ID=meta/llama-3.1-405b-instruct
```

3. Create `.env.backend`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running with Docker

1. Build and start all services:
```bash
docker compose up --build
```

2. Or build and run in detached mode (background):
```bash
docker compose up -d --build
```

3. View running containers:
```bash
docker ps
```

4. View logs:
```bash
# All containers
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend
```

5. Stop services:
```bash
docker compose down
```



The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
   

<!-- CONTRIBUTING -->
## Contributing

If you have an idea to improve this, kindly fork the repository and open a pull request. We also welcome enhancement suggestions filed as issues. 
Stars ⭐ from you will brighten our day! Thanks for checking out our project.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add some NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request




<!-- CONTACT -->
## Contact

Asako Hayase- [LinkedIn](https://www.linkedin.com/in/asako-hayase-924508ba/)


