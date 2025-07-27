from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)  # ✅ Enables CORS for all routes

@app.route('/search')
def search():
    query = request.args.get('q')
    if not query:
        return jsonify({'error': 'Missing query'}), 400

    headers = {
        'User-Agent': 'Mozilla/5.0'
    }
    url = f'https://html.duckduckgo.com/html/?q={query}'

    try:
        res = requests.get(url, headers=headers)
        soup = BeautifulSoup(res.text, 'html.parser')

        results = []
        for result in soup.select('.result'):
            link = result.select_one('.result__a')
            snippet = result.select_one('.result__snippet')
            if link and snippet:
                results.append({
                    'title': link.get_text(strip=True),
                    'url': link['href'],
                    'description': snippet.get_text(strip=True)
                })

        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
