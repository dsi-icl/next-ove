# Setup for development

## Services

- ```mongo``` - central database for auth, project management etc.
- ```mongo-express``` - frontend for mongo service
- ```minio``` - asset storage using the S3 API
- ```static``` - static assets for local mocking of optional external services

### Environment

Please refer to the ```.env.example``` file for an example environment configuration.

### Mongo Setup

[Setup Guide](!https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set-with-keyfile-access-control/)

Please execute the following command on instantiation of the MongoDB ReplicaSet:

```shell
openssl rand -base64 756 > mongo.keyfile
chmod 400 mongo.keyfile
```

```shell
docker exec mongo <SHELL_SCRIPT>
```

Shell Script:

```shell
mongosh --eval "rs.initiate({"_id": "rs0", "version": 1, "members": [{"_id": 0, host: "127.0.0.1:27017", "priority": 1}]})" --username <ROOT_USERNAME> --password
```

### Static Setup

Add any mock assets for external integrations to be served over HTTP.

Examples include the monitoring camera service and calendar integrations.

These assets are stored in the ```public``` directory and loaded in when
the ```static``` image is built.

### Notes

- if behind reverse proxy bridge must have socket path = /{REVERSE_PROXY_PATH}/{CORE_SOCKET_PATH ?? socket.io}