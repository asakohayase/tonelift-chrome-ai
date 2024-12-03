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
            "http://localhost:3000",  # Local development
            "http://frontend:3000",  # Docker container name
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
