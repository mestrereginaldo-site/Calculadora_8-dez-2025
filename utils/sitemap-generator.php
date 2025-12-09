<?php
/**
 * Gerador de Sitemap Dinâmico para Desenrola Direito
 * Gera sitemap.xml com todas as páginas do site
 */

class SitemapGenerator {
    private $baseUrl = 'https://desenroladireito.com.br';
    private $pages = [];
    private $articles = [];
    
    public function __construct() {
        $this->loadPages();
        $this->loadArticles();
    }
    
    private function loadPages() {
        // Páginas estáticas
        $this->pages = [
            ['url' => '/', 'lastmod' => date('Y-m-d'), 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => '/artigos/', 'lastmod' => date('Y-m-d'), 'priority' => '0.9', 'changefreq' => 'daily'],
            ['url' => '/calculators/', 'lastmod' => date('Y-m-d'), 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['url' => '/pages/sobre.html', 'lastmod' => '2025-10-02', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => '/pages/contato.html', 'lastmod' => '2025-10-02', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => '/pages/privacidade.html', 'lastmod' => '2025-10-02', 'priority' => '0.3', 'changefreq' => 'yearly'],
            ['url' => '/pages/termos.html', 'lastmod' => '2025-10-02', 'priority' => '0.3', 'changefreq' => 'yearly'],
        ];
    }
    
    private function loadArticles() {
        // Carregar artigos do JSON ou banco de dados
        $articlesFile = __DIR__ . '/../articles.json';
        
        if (file_exists($articlesFile)) {
            $data = json_decode(file_get_contents($articlesFile), true);
            $this->articles = $data['articles'];
        }
    }
    
    public function generate() {
        header('Content-Type: application/xml; charset=utf-8');
        
        echo '<?xml version="1.0" encoding="UTF-8"?>';
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
                      xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
                      xmlns:xhtml="http://www.w3.org/1999/xhtml"
                      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                      xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">';
        
        // Adicionar páginas estáticas
        foreach ($this->pages as $page) {
            $this->addUrl($page);
        }
        
        // Adicionar artigos
        foreach ($this->articles as $article) {
            $url = '/artigos/' . str_replace(' ', '-', strtolower($article['category'])) . '/' . $article['slug'] . '.html';
            
            $this->addUrl([
                'url' => $url,
                'lastmod' => $article['date'],
                'priority' => '0.8',
                'changefreq' => 'weekly',
                'news' => [
                    'publication' => [
                        'name' => 'Desenrola Direito',
                        'language' => 'pt'
                    ],
                    'publication_date' => $article['date'],
                    'title' => $article['title']
                ]
            ]);
        }
        
        // Adicionar calculadoras
        $calculators = ['trabalhista', 'consumerista', 'pensao-alimenticia', 'multas-condominio', 'correcao-monetaria'];
        
        foreach ($calculators as $calc) {
            $this->addUrl([
                'url' => "/calculators/{$calc}.html",
                'lastmod' => date('Y-m-d'),
                'priority' => '0.7',
                'changefreq' => 'monthly'
            ]);
        }
        
        echo '</urlset>';
    }
    
    private function addUrl($data) {
        echo '<url>';
        echo '<loc>' . htmlspecialchars($this->baseUrl . $data['url']) . '</loc>';
        echo '<lastmod>' . $data['lastmod'] . '</lastmod>';
        echo '<changefreq>' . $data['changefreq'] . '</changefreq>';
        echo '<priority>' . $data['priority'] . '</priority>';
        
        // Adicionar dados de notícias se existirem
        if (isset($data['news'])) {
            echo '<news:news>';
            echo '<news:publication>';
            echo '<news:name>' . htmlspecialchars($data['news']['publication']['name']) . '</news:name>';
            echo '<news:language>' . $data['news']['publication']['language'] . '</news:language>';
            echo '</news:publication>';
            echo '<news:publication_date>' . $data['news']['publication_date'] . '</news:publication_date>';
            echo '<news:title>' . htmlspecialchars($data['news']['title']) . '</news:title>';
            echo '</news:news>';
        }
        
        echo '</url>';
    }
}

// Gerar sitemap
$generator = new SitemapGenerator();
$generator->generate();
