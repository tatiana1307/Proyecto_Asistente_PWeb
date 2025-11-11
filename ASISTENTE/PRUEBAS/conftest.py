"""
Configuración global de pytest para las pruebas
"""
import pytest
import sys
import os
import time
from io import StringIO
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture(scope="session")
def capture_output():
    """Captura la salida de las pruebas para el reporte"""
    old_stdout = sys.stdout
    sys.stdout = mystdout = StringIO()
    yield mystdout
    sys.stdout = old_stdout


def get_chromedriver_path():
    """Obtiene la ruta correcta del ChromeDriver"""
    driver_path = ChromeDriverManager().install()
    driver_dir = os.path.dirname(driver_path)
    
    if os.path.exists(driver_dir):
        chromedriver_path = os.path.join(driver_dir, 'chromedriver')
        if os.path.exists(chromedriver_path) and os.path.isfile(chromedriver_path):
            if not os.access(chromedriver_path, os.X_OK):
                os.chmod(chromedriver_path, 0o755)
            return chromedriver_path
        else:
            for root, dirs, files in os.walk(driver_dir):
                for file in files:
                    if file == 'chromedriver' and not file.endswith('.chromedriver'):
                        candidate = os.path.join(root, file)
                        if os.path.isfile(candidate):
                            if not os.access(candidate, os.X_OK):
                                os.chmod(candidate, 0o755)
                            return candidate
    return driver_path


@pytest.fixture(scope="class")
def shared_driver():
    """Fixture compartido para todas las pruebas de una clase"""
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # Descomentar para ejecutar sin ventana
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument("--disable-gpu")
    
    try:
        driver_path = get_chromedriver_path()
        driver = webdriver.Chrome(
            service=Service(driver_path),
            options=chrome_options
        )
        driver.implicitly_wait(5)
        driver.get("http://localhost:8080")
        time.sleep(2)
        
        yield driver
        
        driver.quit()
    except Exception as e:
        print(f"Error al inicializar el driver compartido: {str(e)}")
        pytest.skip(f"No se pudo inicializar el navegador: {str(e)}")

