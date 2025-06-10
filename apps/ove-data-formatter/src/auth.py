import os
import requests

APP_NAME = "ove-data-formatter"
signing_key = requests.get(os.environ["AUTH_SERVER_URL"]).text


def authorize(role, url):
    # TODO: implement authorization
    print(role, url)
    return True


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]
        if not token:
            return {
                "message": "Authentication Token is missing!",
                "data": None,
                "error": "Unauthorized"
            }, 401
        try:
            data=jwt.decode(token, signing_key, audience=[APP_NAME], algorithms=[os.environ["JWT_ALGORITHM"])
            if not authorize(data.role, request.url):
                return {
                    "message": "Unauthorized",
                    "data": None,
                    "error": "Unauthorized"
                }, 403
        except Exception as e:
            return {
                "message": "Something went wrong",
                "data": None,
                "error": str(e)
            }, 500

        return f(*args, **kwargs)

    return decorated