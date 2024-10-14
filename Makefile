include internal.mk

index_url ?= ''

build-container:
	$(MAKE) -C ./container build index_url=$(index_url)

remove-containers:
	docker compose -f deploy/docker-compose.yaml down || true
	docker stop hello-world anvil-node && docker rm hello-world anvil-node || true

build-multiplatform:
	$(MAKE) -C ./container build-multiplatform

deploy-container: stop-container
	cp ./container/config.json deploy/config.json
	docker compose -f deploy/docker-compose.yaml up -d
	docker logs infernet-node -f

stop-container:
	docker compose -f deploy/docker-compose.yaml kill || true
	docker compose -f deploy/docker-compose.yaml rm -f || true
	docker kill hello-world || true
	docker rm hello-world || true

watch-logs:
	docker compose -f deploy/docker-compose.yaml logs -f

deploy-contracts:
	$(MAKE) -C ./contracts deploy

call-contract:
	$(MAKE) -C ./contracts call-contract

build-service:
	$(MAKE) -C ./$(service) build

run-service:
	$(MAKE) -C ./$(service) run
