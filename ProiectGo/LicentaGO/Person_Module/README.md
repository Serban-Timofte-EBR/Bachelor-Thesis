# person_module
Microservice for managing persons

## Setup Instructions

Follow these steps to set up and run the `person_module` microservice.

1. **Include `.env` file**: Make sure to include a `.env` file in the root directory of your project. Change the wallet path in the `.env` file to point to your local DB wallet.

    Example:
    ```sh
    WALLET_PATH=/path/to/your/local/db/wallet
    ```

2. **Install Dependencies**: Run the following command to install all necessary dependencies:
    ```sh
    go get .
    ```

3. **Run the Microservice**: Start the microservice by running:
    ```sh
    go run .
    ```

4. **Start all the services from Docker in terminal**: Run the next command:
    ```cmd
    docker-compose up --build
    ```

## Environment Variables
Make sure to configure the following environment variables in your `.env` file:
- `WALLET_PATH`: Path to your local DB wallet
