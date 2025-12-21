import os

# Core Configuration
class Config:
    # Project/branding configuration
    PROJECT_NAME = "Workflow Automation for Retail"

    # Default secret key (override with environment variable in production)
    SECRET_KEY = os.environ.get('SECRET_KEY', "change_me_random_key")

    # Default database filename
    DATABASE_PATH = os.environ.get('DATABASE_PATH', 'group_project_ai_ml.db')
    
    # Site domain and base URL (override with env vars)
    SITE_DOMAIN = os.environ.get('SITE_DOMAIN', 'auto-flowai.com')
    BASE_URL = os.environ.get('BASE_URL', f"https://{SITE_DOMAIN}")
    
    # UI Themes
    THEMES = {
        'auth': {
            'primary': '#00d4aa',
            'secondary': '#1a1a1a', 
            'background': '#0f0f0f',
            'surface': '#1a1a1a',
            'text': '#ffffff',
            'text_secondary': '#a0a0a0'
        },
        'workspace': {
            'primary': '#007acc',
            'secondary': '#252526',
            'background': '#1e1e1e',
            'sidebar': '#252526',
            'panel': '#2d2d30',
            'text': '#cccccc',
            'text_secondary': '#969696'
        }
    }
    
    # Workspace Types
    WORKSPACE_TYPES = [
        'personal',
        'team', 
        'scenarios',
        'projects'
    ]