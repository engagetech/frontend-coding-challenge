# Runs the prebuilt dropwizard backend service. If you want to build and run it yourself, the output of mvn package
# will be in the ./target directory
java -jar frontend-challenge-backend-1.0.0.jar server ./src/main/configuration/backend.yml