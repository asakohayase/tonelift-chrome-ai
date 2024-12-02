from fastapi.middleware.cors import CORSMiddleware


# def setup_middlewares(app):
#     # Add CORS middleware
#     app.add_middleware(
#         CORSMiddleware,
#         allow_origins=["http://localhost:3000"],
#         allow_credentials=True,
#         allow_methods=["*"],
#         allow_headers=["*"],
#     )


def setup_middlewares(app):
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://tonelift-ai.vercel.app",  # Production Vercel URL
            "http://34.216.79.83:8000",  # Backend URL
            "http://localhost:3000",  # Local development
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
