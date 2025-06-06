#!/bin/bash

cd certs
mkcert -cert-file localhost.pem -key-file localhost-key.pem \
    millverse-grafana.localhost \
    millverse-datahub.localhost \
    millverse-pathoptimizer.localhost \
    


