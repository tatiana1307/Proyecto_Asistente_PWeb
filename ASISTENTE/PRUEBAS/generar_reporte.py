"""
Generador de Reporte Visual para Pruebas de Selenium
Genera un reporte estilo Selenium/Karate con aprobados y rechazados claramente visibles
"""
import pytest
import os
import datetime
import json
import re
import subprocess
import sys

def ejecutar_pruebas_y_generar_reporte():
    """
    Ejecuta todas las pruebas de Selenium y genera un reporte HTML personalizado.
    """
    print("Preparando para ejecutar pruebas...")
    
    # Intentar usar pytest-json-report si está disponible
    try:
        import pytest_jsonreport
        return ejecutar_con_json_report()
    except ImportError:
        print("⚠️  pytest-json-report no está instalado, usando método alternativo...")
        return ejecutar_sin_json_report()


def ejecutar_con_json_report():
    """Ejecuta pruebas usando pytest-json-report"""
    json_report_path = "pytest_report.json"
    
    pytest_args = [
        "--json-report",
        f"--json-report-file={json_report_path}",
        "--json-report-omit", "call.longrepr", "setup.longrepr", "teardown.longrepr",
        "--json-report-omit", "call.sections", "setup.sections", "teardown.sections",
        "--json-report-omit", "stdout", "stderr", "log",
        "test_login.py", "test_registro.py", "test_chatbot.py"
    ]
    
    try:
        exit_code = pytest.main(pytest_args)
        print(f"Pytest finalizado con código de salida: {exit_code}")
        
        if not os.path.exists(json_report_path):
            print(f"ERROR: No se encontró el archivo de reporte JSON")
            return ejecutar_sin_json_report()
        
        with open(json_report_path, 'r', encoding='utf-8') as f:
            report_data = json.load(f)
        
        html_report_content = generar_html_reporte(report_data)
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"REPORTE_PRUEBAS_{timestamp}.html"
        
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(html_report_content)
        
        print(f"\n✅ Reporte HTML generado exitosamente: {output_filename}")
        print("Puedes abrir este archivo en tu navegador para ver los resultados.")
        
        # Limpiar archivo temporal
        if os.path.exists(json_report_path):
            os.remove(json_report_path)
        
        return exit_code
        
    except Exception as e:
        print(f"❌ Error con json-report: {e}")
        return ejecutar_sin_json_report()


def ejecutar_sin_json_report():
    """Método alternativo que parsea la salida de pytest"""
    print("Ejecutando pruebas y parseando resultados...")
    
    # Ejecutar pytest y capturar salida
    result = subprocess.run(
        [sys.executable, "-m", "pytest", 
         "test_login.py", "test_registro.py", "test_chatbot.py",
         "-v", "--tb=short"],
        capture_output=True,
        text=True,
        cwd=os.getcwd()
    )
    
    exit_code = result.returncode
    stdout = result.stdout
    stderr = result.stderr
    
    # Parsear resultados de la salida
    resultados = parsear_salida_pytest(stdout, stderr)
    
    # Generar reporte HTML
    html_report_content = generar_html_reporte_desde_resultados(resultados)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"REPORTE_PRUEBAS_{timestamp}.html"
    
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(html_report_content)
    
    print(f"\n✅ Reporte HTML generado exitosamente: {output_filename}")
    print("Puedes abrir este archivo en tu navegador para ver los resultados.")
    
    return exit_code


def parsear_salida_pytest(stdout, stderr):
    """Parsea la salida de pytest para extraer información de las pruebas"""
    resultados = {
        'summary': {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'skipped': 0,
            'xfailed': 0,
            'xpassed': 0
        },
        'results': []
    }
    
    lineas = stdout.split('\n')
    pruebas_encontradas = {}
    
    # Buscar pruebas y sus resultados
    for linea in lineas:
        linea = linea.strip()
        
        # Detectar formato: test_login.py::TestLogin::test_1_cargar_pagina_login PASSED
        if '::' in linea and ('PASSED' in linea or 'FAILED' in linea or 'SKIPPED' in linea or 'ERROR' in linea):
            partes = linea.split('::')
            if len(partes) >= 3:
                archivo = partes[0]
                clase = partes[1] if len(partes) > 2 else ''
                nombre_test = partes[-1].split()[0] if len(partes) > 2 else partes[-1].split()[0]
                
                # Extraer resultado
                outcome = 'unknown'
                if 'PASSED' in linea:
                    outcome = 'passed'
                    resultados['summary']['passed'] += 1
                elif 'FAILED' in linea:
                    outcome = 'failed'
                    resultados['summary']['failed'] += 1
                elif 'SKIPPED' in linea:
                    outcome = 'skipped'
                    resultados['summary']['skipped'] += 1
                elif 'ERROR' in linea:
                    outcome = 'failed'
                    resultados['summary']['failed'] += 1
                
                # Extraer duración si está disponible
                duration = 0.0
                tiempo_match = re.search(r'\[(\d+\.\d+)s\]', linea)
                if tiempo_match:
                    duration = float(tiempo_match.group(1))
                
                nodeid = f"{archivo}::{clase}::{nombre_test}" if clase else f"{archivo}::{nombre_test}"
                
                pruebas_encontradas[nodeid] = {
                    'nodeid': nodeid,
                    'outcome': outcome,
                    'duration': duration,
                    'call': {}
                }
    
    # Buscar resumen final
    for linea in lineas:
        if 'passed' in linea.lower() and 'failed' in linea.lower():
            # Formato: "15 passed, 0 failed in 45.23s"
            match = re.search(r'(\d+)\s+passed', linea, re.IGNORECASE)
            if match:
                resultados['summary']['passed'] = int(match.group(1))
            
            match = re.search(r'(\d+)\s+failed', linea, re.IGNORECASE)
            if match:
                resultados['summary']['failed'] = int(match.group(1))
    
    resultados['results'] = list(pruebas_encontradas.values())
    resultados['summary']['total'] = len(resultados['results'])
    
    return resultados


def generar_html_reporte_desde_resultados(resultados):
    """Genera HTML desde resultados parseados"""
    # Convertir a formato compatible con generar_html_reporte
    report_data = {
        'summary': resultados['summary'],
        'results': resultados['results']
    }
    return generar_html_reporte(report_data)


def generar_html_reporte(report_data):
    """
    Genera el contenido HTML del reporte a partir de los datos JSON de pytest.
    """
    summary = report_data.get('summary', {})
    tests = report_data.get('results', [])

    total_tests = summary.get('total', 0)
    passed_tests = summary.get('passed', 0)
    failed_tests = summary.get('failed', 0)
    skipped_tests = summary.get('skipped', 0)
    xfailed_tests = summary.get('xfailed', 0)
    xpassed_tests = summary.get('xpassed', 0)
    
    # Calcular el total de pruebas ejecutadas (excluyendo skipped)
    executed_tests = passed_tests + failed_tests + xfailed_tests + xpassed_tests

    # Determinar el estado general del reporte
    if failed_tests > 0 or xfailed_tests > 0:
        status_class = "failed"
        status_message = "¡ATENCIÓN! Algunas pruebas fallaron."
    elif passed_tests > 0 and executed_tests == passed_tests:
        status_class = "passed"
        status_message = "¡ÉXITO! Todas las pruebas pasaron."
    elif skipped_tests == total_tests:
        status_class = "warning"
        status_message = "⚠️ Todas las pruebas fueron omitidas. Verifica la configuración del entorno."
    else:
        status_class = "warning"
        status_message = "Pruebas ejecutadas con advertencias o sin resultados claros."

    # Agrupar pruebas por archivo
    grouped_tests = {}
    for test in tests:
        # Extraer el nombre del archivo de prueba
        file_name = test['nodeid'].split("::")[0]
        if file_name not in grouped_tests:
            grouped_tests[file_name] = []
        grouped_tests[file_name].append(test)

    test_details_html = ""
    for file_name, file_tests in grouped_tests.items():
        test_details_html += f"""
            <div class="test-file-section">
                <h3>Archivo: {file_name}</h3>
                <div class="test-cases-container">
            """
        for test in file_tests:
            test_name = test['nodeid'].split("::")[-1]
            duration = test.get('duration', 0)
            outcome = test.get('outcome', 'unknown')
            
            # Determinar la clase CSS y el icono basado en el resultado
            test_class = outcome
            icon = "❓"
            if outcome == "passed":
                icon = "✅"
            elif outcome == "failed":
                icon = "❌"
            elif outcome == "skipped":
                icon = "⏭️"
            elif outcome == "xfailed":
                icon = "⚠️"
            elif outcome == "xpassed":
                icon = "✅"

            # Extraer el mensaje de error si existe
            error_message = ""
            if outcome == "failed":
                if 'call' in test and 'longrepr' in test['call']:
                    longrepr = test['call']['longrepr']
                    if isinstance(longrepr, dict) and 'reprcrash' in longrepr:
                        error_message = longrepr['reprcrash'].get('message', 'Error desconocido')
                    elif isinstance(longrepr, str):
                        lines = longrepr.strip().split('\n')
                        if lines:
                            error_message = lines[-1]
                        else:
                            error_message = longrepr
                if not error_message:
                    error_message = "Detalles del error no disponibles en el reporte JSON."
            
            # Limpiar el nombre de la prueba para que sea más legible
            display_test_name = re.sub(r'test_(\w+)_', r'\1 ', test_name.replace('_', ' ')).strip().capitalize()
            
            test_details_html += f"""
                <div class="test-case {test_class}">
                    <div class="test-header">
                        <span class="test-icon">{icon}</span>
                        <span class="test-name">{display_test_name}</span>
                        <span class="test-duration">({duration:.2f}s)</span>
                    </div>
                    {"<pre class='error-details'>" + error_message + "</pre>" if error_message else ""}
                </div>
                """
        test_details_html += "</div></div>"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Pruebas de Selenium</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300,400,500,700&display=swap" rel="stylesheet">
        <style>
            :root {{
                --primary-color: #6E85B7;
                --secondary-color: #B2C8DF;
                --success-color: #28a745;
                --fail-color: #dc3545;
                --warning-color: #ffc107;
                --info-color: #17a2b8;
                --bg-light: #f8f9fa;
                --text-dark: #343a40;
                --text-light: #6c757d;
                --border-color: #e9ecef;
                --card-bg: #ffffff;
                --shadow-light: rgba(0, 0, 0, 0.05);
                --shadow-medium: rgba(0, 0, 0, 0.1);
            }}

            body {{
                font-family: 'Roboto', sans-serif;
                margin: 0;
                padding: 0;
                background-color: var(--bg-light);
                color: var(--text-dark);
                line-height: 1.6;
            }}

            .container {{
                max-width: 1200px;
                margin: 20px auto;
                padding: 20px;
                background-color: var(--card-bg);
                border-radius: 12px;
                box-shadow: 0 4px 20px var(--shadow-medium);
            }}

            .header {{
                background: linear-gradient(135deg, var(--primary-color) 0%, #5a6fa5 100%);
                color: white;
                padding: 40px 20px;
                border-radius: 12px 12px 0 0;
                text-align: center;
                margin: -20px -20px 20px -20px;
                box-shadow: 0 2px 10px var(--shadow-medium);
            }}

            .header h1 {{
                margin: 0;
                font-size: 2.8em;
                font-weight: 700;
                letter-spacing: 1px;
            }}

            .header p {{
                font-size: 1.1em;
                opacity: 0.9;
            }}

            .status-banner {{
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 8px;
                font-weight: 700;
                text-align: center;
                font-size: 1.1em;
                color: white;
                box-shadow: 0 2px 8px var(--shadow-light);
            }}

            .status-banner.passed {{ background-color: var(--success-color); }}
            .status-banner.failed {{ background-color: var(--fail-color); }}
            .status-banner.warning {{ background-color: var(--warning-color); color: var(--text-dark); }}

            .stats-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }}

            .stat-card {{
                background-color: var(--bg-light);
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px var(--shadow-light);
                text-align: center;
                transition: transform 0.2s ease-in-out;
                border: 1px solid var(--border-color);
            }}

            .stat-card:hover {{
                transform: translateY(-5px);
            }}

            .stat-card h4 {{
                margin-top: 0;
                color: var(--text-light);
                font-size: 0.9em;
                font-weight: 500;
            }}

            .stat-card .value {{
                font-size: 2.2em;
                font-weight: 700;
                margin: 5px 0 0;
            }}

            .stat-card.total .value {{ color: var(--primary-color); }}
            .stat-card.passed .value {{ color: var(--success-color); }}
            .stat-card.failed .value {{ color: var(--fail-color); }}
            .stat-card.skipped .value {{ color: var(--info-color); }}
            .stat-card.xfailed .value {{ color: var(--warning-color); }}
            .stat-card.xpassed .value {{ color: var(--success-color); }}

            h2 {{
                font-size: 1.8em;
                color: var(--primary-color);
                border-bottom: 2px solid var(--primary-color);
                padding-bottom: 10px;
                margin-top: 40px;
                margin-bottom: 25px;
            }}

            .test-file-section {{
                background-color: var(--card-bg);
                border-radius: 10px;
                box-shadow: 0 2px 10px var(--shadow-light);
                margin-bottom: 25px;
                padding: 20px;
                border: 1px solid var(--border-color);
            }}

            .test-file-section h3 {{
                color: var(--primary-color);
                margin-top: 0;
                font-size: 1.4em;
                border-bottom: 1px dashed var(--border-color);
                padding-bottom: 10px;
                margin-bottom: 20px;
            }}

            .test-cases-container {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
            }}

            .test-case {{
                background-color: var(--bg-light);
                border-radius: 8px;
                padding: 15px;
                border: 1px solid var(--border-color);
                display: flex;
                flex-direction: column;
                transition: all 0.2s ease-in-out;
            }}

            .test-case.passed {{ border-left: 5px solid var(--success-color); }}
            .test-case.failed {{ border-left: 5px solid var(--fail-color); }}
            .test-case.skipped {{ border-left: 5px solid var(--info-color); }}
            .test-case.xfailed {{ border-left: 5px solid var(--warning-color); }}
            .test-case.xpassed {{ border-left: 5px solid var(--success-color); }}

            .test-case:hover {{
                transform: translateY(-3px);
                box-shadow: 0 4px 12px var(--shadow-light);
            }}

            .test-header {{
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }}

            .test-icon {{
                font-size: 1.2em;
                margin-right: 10px;
            }}

            .test-name {{
                font-weight: 600;
                color: var(--text-dark);
                flex-grow: 1;
            }}

            .test-duration {{
                font-size: 0.85em;
                color: var(--text-light);
            }}

            .error-details {{
                background-color: #fdf3f3;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 10px;
                border-radius: 6px;
                font-size: 0.85em;
                white-space: pre-wrap;
                word-break: break-all;
                margin-top: 10px;
            }}

            .footer {{
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
                color: var(--text-light);
                font-size: 0.9em;
            }}

            @media (max-width: 768px) {{
                .header h1 {{ font-size: 2em; }}
                .stats-grid {{ grid-template-columns: 1fr; }}
                .test-cases-container {{ grid-template-columns: 1fr; }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reporte de Pruebas de Selenium</h1>
                <p>Resultados de la ejecución de pruebas automatizadas para el Asistente de Proyectos</p>
                <p>Fecha de Ejecución: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            </div>

            <div class="status-banner {status_class}">
                {status_message}
            </div>

            <h2>Resumen General</h2>
            <div class="stats-grid">
                <div class="stat-card total">
                    <h4>Total de Pruebas</h4>
                    <p class="value">{total_tests}</p>
                </div>
                <div class="stat-card passed">
                    <h4>Aprobadas</h4>
                    <p class="value">{passed_tests}</p>
                </div>
                <div class="stat-card failed">
                    <h4>Fallidas</h4>
                    <p class="value">{failed_tests}</p>
                </div>
                <div class="stat-card skipped">
                    <h4>Omitidas</h4>
                    <p class="value">{skipped_tests}</p>
                </div>
                <div class="stat-card xfailed">
                    <h4>Esperadas Fallidas</h4>
                    <p class="value">{xfailed_tests}</p>
                </div>
                <div class="stat-card xpassed">
                    <h4>Esperadas Pasadas</h4>
                    <p class="value">{xpassed_tests}</p>
                </div>
            </div>

            <h2>Detalle de Pruebas</h2>
            {test_details_html}

            <div class="footer">
                Generado por el sistema de pruebas automatizadas.
            </div>
        </div>
    </body>
    </html>
    """
    return html_content

