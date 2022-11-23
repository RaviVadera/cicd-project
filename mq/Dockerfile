FROM rabbitmq:3
# To prevent an issue with erlang cookie permission when deriving the rabbitmq image
USER rabbitmq
# Configure stage-3 healthcheck
HEALTHCHECK --interval=2s --timeout=5s --start-period=1s --retries=15 CMD rabbitmq-diagnostics -q check_running && rabbitmq-diagnostics -q check_local_alarms