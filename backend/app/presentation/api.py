from dataclasses import asdict

from flask import Blueprint, jsonify

from app.application.services.course_service import CourseService


def create_api_blueprint(course_service: CourseService) -> Blueprint:
    api = Blueprint("api", __name__)

    @api.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "alianza-contigo-api"})

    @api.get("/courses")
    def list_courses():
        return jsonify([asdict(course) for course in course_service.list_courses()])

    @api.get("/courses/<slug>")
    def get_course(slug: str):
        course = course_service.get_course(slug)
        if course is None:
            return jsonify({"error": "course_not_found", "message": "Programa no encontrado"}), 404
        return jsonify(asdict(course))

    return api
