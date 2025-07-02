import logging
import sys

def setup_logging(log_level=logging.INFO, log_to_file=False, log_file="app.log"):
    """
    Configures centralized logging for the application.

    Args:
        log_level (int): The logging level (e.g., logging.DEBUG, logging.INFO).
        log_to_file (bool): Whether to log messages to a file.
        log_file (str): The file to log messages to if log_to_file is True.
    """
    # Set the logging format
    log_format = '%(asctime)s - %(levelname)s - %(message)s'
    
    # Configure the root logger
    if log_to_file:
        logging.basicConfig(
            level=log_level,
            format=log_format,
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )
    else:
        logging.basicConfig(
            level=log_level,
            format=log_format,
            stream=sys.stdout
        )
    
    # Optionally add more specific loggers for modules
    logger = logging.getLogger(__name__)
    logger.info("Logging is set up.")

    return logger
