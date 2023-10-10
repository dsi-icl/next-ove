Please execute the following command on instantiation of the MongoDB ReplicaSet:

```shell
docker exec mongo ${SHELL_SCRIPT}
```

Shell Script:

```shell
mongosh --eval "rs.initiate({"_id": "rs0", "version": 1, "members": [{"_id": 0, host: "127.0.0.1:27017", "priority": 1}]})" --username ${ROOT_USERNAME} --password
```