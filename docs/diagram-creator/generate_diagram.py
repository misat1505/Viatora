"""
Microservices architecture diagram for Viatora.
Requirements: pip install diagrams (and Graphviz installed)
Run: python diagram.py
Output: microservices_architecture.png
"""

from diagrams import Cluster, Diagram, Edge
from diagrams.custom import Custom
from diagrams.onprem.client import Users
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.inmemory import Redis
from diagrams.programming.framework import Nextjs, Spring
from diagrams.programming.language import Python

graph_attr = {
    "fontsize": "14",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "spline",
}


with Diagram(
    "Viatora Architecture",
    filename="microservices_architecture",
    show=False,
    direction="TB",
    graph_attr=graph_attr,
):
    user = Users("User\nWeb / Mobile")

    web = Nextjs("Web App")

    with Cluster("Backend"):
        gateway = Custom(
            "API Gateway",
            "./icons/nestjs.png",
        )
        cache = Redis("Rate limiting & cache")

        with Cluster("Identity"):
            auth = Python("Auth Service")
            auth_db = PostgreSQL("Auth DB")
            auth >> Edge() >> auth_db

        with Cluster("Learning Flow"):
            exam = Custom(
                "Exam Engine",
                "./icons/nestjs.png",
            )
            exam_db = PostgreSQL("Exam DB")
            exam_cache = Redis("Exam Session Cache")
            exam >> Edge() >> exam_db
            exam >> Edge(label="session state") >> exam_cache

        with Cluster("Content"):
            content = Custom(
                "Content Service",
                "./icons/nestjs.png",
            )
            sanity = Custom(
                "Sanity CMS",
                "./icons/sanity.png",
            )
            content_cache = Redis("Question Cache")
            content >> Edge(label="content queries") >> content_cache
            content >> Edge(label="content source") >> sanity

        with Cluster("Payments"):
            payment = Spring("Payment Service")
            stripe = Custom(
                "Stripe",
                "./icons/stripe.png",
            )
            payment_db = PostgreSQL("Payment DB")
            payment >> Edge() >> payment_db
            payment >> Edge(label="checkout / webhooks") >> stripe

        with Cluster("AI Assistant"):
            assistant = Custom(
                "AI Assistant",
                "./icons/nestjs.png",
            )
            openrouter = Custom(
                "OpenRouter",
                "./icons/openrouter.png",
            )
            assistant_db = PostgreSQL("Assistant DB")
            assistant >> Edge() >> assistant_db
            assistant >> Edge(label="LLM requests") >> openrouter

    user >> web
    web >> Edge(label="HTTP/HTTPS") >> gateway

    gateway >> Edge(label="JWT / OAuth (gRPC)") >> auth
    gateway >> Edge(label="exam sessions (gRPC)") >> exam
    gateway >> Edge(label="questions (gRPC)") >> content
    gateway >> Edge(label="checkout / subscriptions (gRPC)") >> payment
    gateway >> Edge(label="assistant chat (gRPC)") >> assistant
    gateway >> Edge(label="cache & throttling") >> cache

    exam >> Edge(label="question fetch (gRPC)") >> content
    exam >> Edge(label="subscription check (gRPC)") >> payment
    assistant >> Edge(label="question context (gRPC)") >> content
