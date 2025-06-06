#!/bin/bash
set -e

echo "Kong Custom Entrypoint: Processing configuration template..."

if [ -f "/kong/config.template.yml" ]; then
    echo "Found template file, generating configuration..."

    envsubst < /kong/config.template.yml > /kong/config.yml
    
    export KONG_DECLARATIVE_CONFIG=/kong/config.yml
else
    echo "No template file found at /kong/kong.yml.template"
    echo "Using existing configuration or default settings"
fi

. /docker-entrypoint.sh