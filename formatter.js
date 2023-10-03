module.exports = function(results, context) {
    //console.log(results);
    return `
        <html>
            ${getHead()}
            ${getBody(results, context)}
        </html>
    `;
};



function getHead() {
    return `
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="envWorkingFolder" content="${process.env.GITHUB_DIR}" >
            <meta name="envWorkingRepo" content="${process.env.REPO}" >
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
            <style type="text/css">
              :root {
                --main-bg-color: #01AFFF;
                --main-txt-color: #354350;
                --bs-body-color: #FFFFFF;
                --bs-danger-rgb: 220,53,69;
                --bs-warning-rgb: 255,193,7;
                --bs-white-rgb: 255,255,255;
              }
        
              body {
                background: var(--main-bg-color);
              }
        
              .bd-main h2, .bd-main h3, .bd-main h4, .bd-main h5, .bd-main p, .bd-main span, .accordion-item {
                color: var(--main-txt-color);
              }
        
              .bd-sidebar {
                grid-area: sidebar
              }
        
              .bd-links li:hover a {
                 background: #2F48FA;
              }
        
              .bd-links-link {
                padding: 0.1875rem 0.5rem;
                margin-top: 0.125rem;
                margin-left: 1.125rem;
                color: var(--bs-body-color);
                text-decoration: none;
              }
        
              .acc-title {
                display: grid;
                width: 95%;
                grid-template-columns: 1fr 6fr 4fr;
              }
        
              .bd-main pre {
                color: rgb(var(--bs-white-rgb));
                background: var(--main-txt-color);
              }
        
              .bd-main code span {
                padding: 2px 2px;
                border-radius: 3px;
              }
        
              .bd-main .error code span {
                color: rgb(var(--bs-white-rgb));
                background: rgb(var(--bs-danger-rgb));
              }
        
              .bd-main .warning code span {
                color: rgb(var(--bs-white-rgb));
                background: rgb(var(--bs-warning-rgb));
              }
        
              @media (min-width: 768px) {
                .bd-main {
                    display:grid;
                    background: aliceblue;
                    grid-template-areas: "intro" "toc" "content";
                    grid-template-rows: auto auto 1fr;
                    gap: inherit;
                    min-height: 100vh
                }
              }
        
              @media (min-width: 992px) {
                .bd-sidebar {
                    position: sticky;
                    top: 5rem;
                    display: block !important;
                    height: calc(100vh - 6rem);
                    padding-left: 0.25rem;
                    margin-left: -0.25rem;
                    overflow-y: auto;
                }
        
                .bd-layout {
                    margin-top: 0px;
                    display:grid;
                    grid-template-areas: "sidebar main";
                    grid-template-columns: 1fr 5fr;
                    gap: 1.5rem
                }
              }
            </style>
          </head>
    `
}

function getBody(sonarResults, sonarContext) {
    return `
        <body>
            <div class="container-fluid px-0 bd-gutter bd-layout">
                <aside class="bd-sidebar py-3">
                    <div class="offcanvas-lg offcanvas-start" tabindex="-1" id="bdSidebar" aria-labelledby="bdSidebarOffcanvasLabel">
                        <div class="offcanvas-body">
                            <nav class="bd-links w-100" id="bd-docs-nav" aria-label="Docs navigation">
                                ${getAsideContent(sonarResults)}
                            </nav>
                      </div>
                    </div>
                </aside>
                <main class="bd-main order-1 py-3 px-3">
                    <div class="bd-content ps-lg-2">
                        <h2 id="how-it-works">Setel ESLint</h2>
                        <div id="content">
                            ${createMainErrorsContent(sonarResults, sonarContext)}
                        </div>
                    </div>
                </main>
            </div>
        </body>
    `
}

function getAsideContent(sonarResults) {
    const tree = {};
    for (const file of sonarResults.map(result => result.filePath)) {
        addToTree(tree, file);
    }

    return treeToHtml(tree);
}

function addToTree(tree, path) {
    const sanitizedPath = path.replace(/^\//, '');
    const pathComponents = sanitizedPath.split('/');
    const filename = pathComponents.pop();
    let currentTree = tree;

    for (const folderName of pathComponents) {
        if (!currentTree[folderName]) currentTree[folderName] = {};
        currentTree = currentTree[folderName];
    }

    currentTree[filename] = sanitizedPath.replace(/\//g, '-');
}

function treeToHtml(tree) {
    if (typeof tree === 'string') return '';

    const items = [];
    for (const child of Object.keys(tree)) {
        const childValue = tree[child];
        items.push(typeof childValue === 'string'
            ? `<li><a href="#card-${childValue.replace(/^\//, '').replace(/\//g, '-').replace(/\./g, '_')}" class="bd-links-link d-inline-block rounded">${child}</a></li>`
            : `<li>${child}</li>${treeToHtml(tree[child])}`);
    }

    return `<ul class="list-unstyled fw-normal pb-2 ps-3">${items.join('')}</ul>`;
}

function createMessageAccordion(msg, msgId, sanitizedPath, line, sonarContext) {
    const accordionId = `acc-${msgId}-${sanitizedPath}`;
    const accordionMsgId = `title-${msgId}-${sanitizedPath}`;
    const isError = msg.severity === 2;
    return `
        <div class="accordion mb-2 ${ isError ? 'error' : 'warning'}" id="${accordionId}">
            <div class="accordion-item rounded-0">
                <div class="accordion-button py-1 rounded-0 ${ isError ? 'bg-danger text-white' : 'bg-warning text-dark'}" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#${accordionMsgId}" 
                    aria-expanded="false" 
                    aria-controls="${accordionMsgId}">
                    <div class="acc-title">
                        <span class="${ isError ? 'text-white' : 'text-dark'}"> ${msg.line}:${msg.column} </span>
                        <span class="${ isError ? 'text-white' : 'text-dark'}"> ${msg.message} </span>
                        <span class="text-end ${ isError ? 'text-white' : 'text-dark'}"> ${msg.ruleId} </span>
                    </div>
                </div>
            
                <div id="${accordionMsgId}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                    <div class="accordion-body"> 
                        <p>
                            ${sonarContext.rulesMeta[msg.ruleId]?.docs.description} [<a target="_blank" href="${sonarContext.rulesMeta[msg.ruleId]?.docs.url}">Link</a>]
                        </p>
                        <pre class="p-2 rounded-2"><code>${line}</code></pre>
            
                    </div>
                </div>
            </div>
        </div>
	`
}

function createErrorCard(file, sonarContext) {
    const sanitizedPath = file.filePath
        .replace(/^\//, '')
        .replace(/\//g, '-')
        .replace(/\./g, '_');

    const cardId = `card-${sanitizedPath}`;
    const cardBodyId = `card-body-${sanitizedPath}`;
    const codeLines = file.source.split('\n');
    const numberOfLines = codeLines.length;
    const getLines = (line) => {
        const { begin, end } = _getRange(numberOfLines, line)
        return Array.from({ length: (end - begin)}, (v, idx) => begin + idx).map(idx => {
            if (idx === line) return `<span>${codeLines[idx]}</span>`
            return codeLines[idx]
        }).join("</br>");
    }

    const msg = file.messages.map((msg, idx) => {
        return createMessageAccordion(msg, idx, sanitizedPath, getLines(msg.line - 1), sonarContext)
    }).join('');

    return `
		<div id="${cardId}" class="card mb-2">
			<div class="card-header" data-bs-toggle="collapse" data-bs-target="#${cardBodyId}" aria-expanded="true" aria-controls="${cardBodyId}">
				<span >${file.filePath}</span>
				<span class="badge text-bg-danger">${file.errorCount}</span>
				<span class="badge text-bg-warning">${file.warningCount}</span>
			</div>
		  <div class="card-body collapse show" id="${cardBodyId}">${msg}</div>
		</div>
	`
}

function createMainErrorsContent(sonarResults, sonarContext) {
    return sonarResults.filter(({errorCount,warningCount }) => {
        return errorCount || warningCount
    }).map(file => {
        return createErrorCard(file, sonarContext);
    }).join('');
}

function _getRange(limit, current) {
    const begin = current - 2;
    const end = current + 3;
    const diff = end - limit;

    if (begin < 0) return {begin: 0, end: Math.min(limit, 5)}
    if (end > limit)  return { begin: Math.max(0, begin - diff), end: limit};

    return { begin, end };
}
