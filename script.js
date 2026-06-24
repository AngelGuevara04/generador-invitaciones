document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los inputs
    const inputs = {
        fraseText: document.getElementById('fraseText'),
        mes: document.getElementById('mes'),
        dia: document.getElementById('dia'),
        hora: document.getElementById('hora'),
        lugar: document.getElementById('lugar'),
        tituloPrincipal: document.getElementById('tituloPrincipal'),
        generacion: document.getElementById('generacion'),
        listaAlumnos: document.getElementById('listaAlumnos'),
        genPadrino: document.getElementById('genPadrino'),
        programaCivicoText: document.getElementById('programaCivicoText'),
        programaSocialText: document.getElementById('programaSocialText'),
        invitadosText: document.getElementById('invitadosText'),
        fontSelector: document.getElementById('fontSelector'),
        mainColor: document.getElementById('mainColor'),
        darkColor: document.getElementById('darkColor'),
        goldColor: document.getElementById('goldColor'),
        showQr: document.getElementById('showQr'),
        qrUrl: document.getElementById('qrUrl'),
        qrText: document.getElementById('qrText'),
        alumnosSizeSlider: document.getElementById('alumnosSizeSlider'),
        alumnosSizeValue: document.getElementById('alumnosSizeValue')
    };

    const previews = {
        frase: document.getElementById('previewFrase'),
        mes: document.getElementById('previewMes'),
        dia: document.getElementById('previewDia'),
        hora: document.getElementById('previewHora'),
        lugar: document.getElementById('previewLugar'),
        titulo: document.getElementById('previewTitulo'),
        genPadrino: document.getElementById('previewGenPadrino'),
        programa: document.getElementById('previewPrograma'),
        invitados: document.getElementById('previewInvitados'),
        alumnosCol1: document.getElementById('previewAlumnosCol1'),
        alumnosCol2: document.getElementById('previewAlumnosCol2'),
        generacion: document.getElementById('previewGeneracion'),
        qrContainerWrapper: document.getElementById('qrContainerWrapper'),
        previewQr: document.getElementById('previewQr'),
        previewQrText: document.getElementById('previewQrText')
    };
    
    const qrSettingsBox = document.getElementById('qrSettingsBox');
    let qrCode = null;

    // Zoom Logic
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomValueDisplay = document.getElementById('zoomValue');
    const sheetsWrapper = document.getElementById('sheetsWrapper');

    function applyZoom() {
        const val = zoomSlider.value;
        sheetsWrapper.style.transform = `scale(${val})`;
        zoomValueDisplay.textContent = Math.round(val * 100) + '%';
        // Adjust margin so scrolling feels natural when scaled down
        if (val < 1) {
            sheetsWrapper.style.marginBottom = `-${(1 - val) * 8.5 * 2 * 96}px`; // Approximate height compensation
        } else {
            sheetsWrapper.style.marginBottom = '0';
        }
        localStorage.setItem('invitationZoom', val);
    }

    zoomSlider.addEventListener('input', applyZoom);
    
    // Alumnos Size Logic
    inputs.alumnosSizeSlider.addEventListener('input', () => {
        const val = inputs.alumnosSizeSlider.value;
        inputs.alumnosSizeValue.textContent = val + 'rem';
        localStorage.setItem('invitationAlumnosSize', val);
        updatePreview();
    });

    const extraFieldsContainer = document.getElementById('extraFieldsContainer');
    const addExtraFieldBtn = document.getElementById('addExtraFieldBtn');

    // Dynamic Fields Logic
    let extraFields = []; // format: {id: number, key: string, value: string}
    let extraFieldCounter = 0;

    function renderExtraFields() {
        extraFieldsContainer.innerHTML = '';
        extraFields.forEach((field, index) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.gap = '0.5rem';
            row.style.marginBottom = '0.5rem';
            row.innerHTML = `
                <input type="text" placeholder="Ej: Vestimenta" style="width: 40%; margin: 0; padding: 0.5rem;" value="${field.key}" oninput="updateExtraField(${index}, 'key', this.value)">
                <input type="text" placeholder="Ej: Formal" style="width: 50%; margin: 0; padding: 0.5rem;" value="${field.value}" oninput="updateExtraField(${index}, 'value', this.value)">
                <button class="btn-secondary" style="width: 10%; margin: 0; padding: 0; color: #d9534f; border-color: #d9534f;" onclick="removeExtraField(${index})">X</button>
            `;
            extraFieldsContainer.appendChild(row);
        });
    }

    window.updateExtraField = (index, prop, val) => {
        extraFields[index][prop] = val;
        updatePreview();
    };

    window.removeExtraField = (index) => {
        extraFields.splice(index, 1);
        renderExtraFields();
        updatePreview();
    };

    addExtraFieldBtn.addEventListener('click', () => {
        extraFields.push({ id: extraFieldCounter++, key: '', value: '' });
        renderExtraFields();
        updatePreview();
    });

    // Función para actualizar la vista previa
    function updatePreview() {
        // Textos simples
        const fraseLineas = inputs.fraseText.value.split('\n').filter(line => line.trim() !== '');
        previews.frase.innerHTML = fraseLineas.join('<br>');
        
        previews.genPadrino.textContent = inputs.genPadrino.value;
        previews.mes.textContent = inputs.mes.value.toUpperCase();
        previews.dia.textContent = inputs.dia.value;
        previews.hora.textContent = inputs.hora.value;
        previews.lugar.innerHTML = inputs.lugar.value.split('\n').filter(line => line.trim() !== '').join('<br>');
        previews.titulo.textContent = inputs.tituloPrincipal.value;
        previews.generacion.textContent = "Generación " + inputs.generacion.value;

        // Procesar Alumnos: Col1 para Alumnos, Col2 para Padrinos
        const alumnosList = inputs.listaAlumnos.value.split('\n').filter(line => line.trim() !== '');
        
        let htmlCol1 = '';
        let htmlCol2 = '';

        alumnosList.forEach((line) => {
            const parts = line.split('|');
            const alumno = parts[0] ? parts[0].trim() : '&nbsp;';
            const padrino = parts[1] ? parts[1].trim() : '&nbsp;';
            
            htmlCol1 += `
            <div class="alumno-item">
                <div class="alumno-name"><span class="alumno-bullet">♦</span> ${alumno}</div>
            </div>`;
            
            htmlCol2 += `
            <div class="alumno-item">
                <div class="alumno-padrino-name">${padrino}</div>
            </div>`;
        });
        
        previews.alumnosCol1.innerHTML = htmlCol1;
        previews.alumnosCol2.innerHTML = htmlCol2;
        const formatProgram = (text) => {
            return text.split('\n')
                .filter(line => line.trim() !== '')
                .map((line, idx) => {
                    const num = (idx + 1).toString().padStart(2, '0');
                    return `<p>${num}.- ${line}</p>`;
                }).join('');
        };

        const civicoHtml = formatProgram(inputs.programaCivicoText.value);
        const socialHtml = formatProgram(inputs.programaSocialText.value);
        
        let programaHtml = '';
        if (civicoHtml) {
            programaHtml += `<div class="program-subtitle">ACTO CÍVICO</div><div class="programa-columns">${civicoHtml}</div>`;
        }
        if (socialHtml) {
            programaHtml += `<div class="program-subtitle mt-custom">ACTO SOCIAL</div><div class="programa-columns">${socialHtml}</div>`;
        }
        previews.programa.innerHTML = programaHtml;

        // Procesar Invitados
        const invitadosLineas = inputs.invitadosText.value.split('\n').filter(line => line.trim() !== '');
        previews.invitados.innerHTML = invitadosLineas.map(line => {
            const parts = line.split('|');
            const name = parts[0] ? parts[0].trim() : '';
            const role = parts[1] ? parts[1].trim() : '';
            if (role) {
                return `<div style="margin-bottom: 0.5rem;"><div class="guest-name">${name}</div><div class="guest-role">${role}</div></div>`;
            } else {
                return `<div style="margin-bottom: 0.5rem;"><div class="guest-name">${name}</div></div>`;
            }
        }).join('');

        // Aplicar tamaño de letra personalizado para alumnos
        const baseSize = inputs.alumnosSizeSlider.value;
        document.documentElement.style.setProperty('--alumno-base-size', `${baseSize}rem`);

        // Aplicar Colores
        document.documentElement.style.setProperty('--emerald-main', inputs.mainColor.value);
        document.documentElement.style.setProperty('--emerald-dark', inputs.darkColor.value);
        document.documentElement.style.setProperty('--gold-main', inputs.goldColor.value);

        // Aplicar fuente seleccionada
        const fontName = inputs.fontSelector.value;
        document.querySelectorAll('.title, .subtitle-gen, .alumnos-list, .invitados-list, .programa-list, .alumno-name').forEach(el => {
            el.style.fontFamily = fontName;
        });

        // Procesar QR con Enlace Simple
        if (inputs.showQr.checked) {
            qrSettingsBox.style.display = 'block';
            previews.qrContainerWrapper.style.display = 'flex';
            previews.previewQrText.textContent = inputs.qrText.value;
            
            const simpleUrl = inputs.qrUrl.value || 'https://misantla.tecnm.mx/';

            previews.previewQr.innerHTML = ''; // Limpiar para regenerar
            
            qrCode = new QRCode(previews.previewQr, {
                text: simpleUrl,
                width: 65,
                height: 65,
                colorDark : inputs.darkColor.value,
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.M
            });
        } else {
            qrSettingsBox.style.display = 'none';
            previews.qrContainerWrapper.style.display = 'none';
        }

        saveToLocalStorage();
    }

    // Agregar event listeners a todos los inputs
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // --- LÓGICA DEL EDITOR DE VECTORES ---
    const toggleEditorBtn = document.getElementById('toggleEditorBtn');
    const resetEditorBtn = document.getElementById('resetEditorBtn');
    let isEditing = false;
    let editorLayer = null;

    const originalCurve = {
        p0: {x: 175, y: 0},
        c1: {x: 165, y: 55},
        c2: {x: 120, y: 65},
        p1: {x: 85, y: 100},
        c3: {x: 50, y: 135},
        c4: {x: 25, y: 165},
        p2: {x: 0, y: 175}
    };

    const curve = JSON.parse(JSON.stringify(originalCurve));

    function saveToLocalStorage() {
        const data = {};
        Object.keys(inputs).forEach(key => {
            if (inputs[key].type === 'checkbox') {
                data[key] = inputs[key].checked;
            } else {
                data[key] = inputs[key].value;
            }
        });
        localStorage.setItem('invitationData', JSON.stringify(data));
        localStorage.setItem('invitationCurve', JSON.stringify(curve));
        localStorage.setItem('invitationExtraFields', JSON.stringify(extraFields));
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('invitationData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(inputs).forEach(key => {
                    if (data[key] !== undefined) {
                        if (inputs[key].type === 'checkbox') {
                            inputs[key].checked = data[key];
                        } else {
                            inputs[key].value = data[key];
                        }
                    }
                });
            } catch (e) { console.error('Error loading data', e); }
        }

        const savedExtra = localStorage.getItem('invitationExtraFields');
        if (savedExtra) {
            try {
                extraFields = JSON.parse(savedExtra);
                extraFieldCounter = extraFields.length;
            } catch (e) { console.error('Error loading extra fields', e); }
        }
        renderExtraFields();

        const savedCurve = localStorage.getItem('invitationCurve');
        if (savedCurve) {
            try {
                const parsedCurve = JSON.parse(savedCurve);
                Object.keys(curve).forEach(key => {
                    if (parsedCurve[key]) {
                        curve[key] = parsedCurve[key];
                    }
                });
            } catch (e) { console.error('Error loading curve', e); }
        }

        const savedZoom = localStorage.getItem('invitationZoom');
        if (savedZoom) {
            zoomSlider.value = savedZoom;
        }

        const savedAlumnosSize = localStorage.getItem('invitationAlumnosSize');
        if (savedAlumnosSize) {
            inputs.alumnosSizeSlider.value = savedAlumnosSize;
            inputs.alumnosSizeValue.textContent = savedAlumnosSize + 'rem';
        }
    }

    function generateHtmlDownload() {
        const dataToEncode = {
            frase: inputs.fraseText.value,
            mes: inputs.mes.value,
            dia: inputs.dia.value,
            hora: inputs.hora.value,
            lugar: inputs.lugar.value,
            titulo: inputs.tituloPrincipal.value,
            generacion: inputs.generacion.value,
            programaCivico: inputs.programaCivicoText.value,
            programaSocial: inputs.programaSocialText.value,
            invitados: inputs.invitadosText.value,
            padrino: inputs.genPadrino.value,
            alumnos: inputs.listaAlumnos.value,
            font: inputs.fontSelector.value,
            mainC: inputs.mainColor.value,
            darkC: inputs.darkColor.value,
            goldC: inputs.goldColor.value,
            extra: extraFields.filter(f => f.key.trim() !== '')
        };

        const jsonString = JSON.stringify(dataToEncode);
        const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

        // Attempt to fetch the template if hosted, otherwise fallback to basic structure
        fetch('detalles/index.html')
            .then(response => {
                if(!response.ok) throw new Error("Local");
                return response.text();
            })
            .catch(() => {
                // Si falla (por ejemplo, en local file://), pedimos al usuario que suba la carpeta detalles
                alert("Para generar la página estática, debes estar ejecutando este proyecto en un servidor (como GitHub Pages). Sin embargo, el QR ahora usará el enlace directo que pongas. Te recomendamos subir la carpeta 'detalles' y poner ese enlace.");
                return null;
            })
            .then(html => {
                if(!html) return;
                
                // Modify the HTML to include the data as a global variable instead of hash
                let newHtml = html.replace('const hash = window.location.hash;', `const hash = '#data=${base64Data}';`);
                
                // Fix CSS link to be absolute or inline if needed, but relative is fine if they upload it to the same folder structure
                const blob = new Blob([newHtml], { type: 'text/html' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'pagina_detalles.html';
                a.click();
            });
    }

    const downloadWebBtn = document.getElementById('downloadWebBtn');
    if (downloadWebBtn) {
        downloadWebBtn.addEventListener('click', generateHtmlDownload);
    }

    function updatePaths() {
        const dMain = `M ${curve.p0.x},${curve.p0.y} C ${curve.c1.x},${curve.c1.y} ${curve.c2.x},${curve.c2.y} ${curve.p1.x},${curve.p1.y} C ${curve.c3.x},${curve.c3.y} ${curve.c4.x},${curve.c4.y} ${curve.p2.x},${curve.p2.y} L 0,0 Z`;
        const dGold = `M ${curve.p0.x},${curve.p0.y} C ${curve.c1.x},${curve.c1.y} ${curve.c2.x},${curve.c2.y} ${curve.p1.x},${curve.p1.y} C ${curve.c3.x},${curve.c3.y} ${curve.c4.x},${curve.c4.y} ${curve.p2.x},${curve.p2.y}`;
        
        const sf = 1.14; // Factor de escala para la sombra
        const dDark = `M ${curve.p0.x*sf},${curve.p0.y*sf} C ${curve.c1.x*sf},${curve.c1.y*sf} ${curve.c2.x*sf},${curve.c2.y*sf} ${curve.p1.x*sf},${curve.p1.y*sf} C ${curve.c3.x*sf},${curve.c3.y*sf} ${curve.c4.x*sf},${curve.c4.y*sf} ${curve.p2.x*sf},${curve.p2.y*sf} L 0,0 Z`;

        document.querySelectorAll('.blob-main').forEach(el => el.setAttribute('d', dMain));
        document.querySelectorAll('.blob-gold').forEach(el => el.setAttribute('d', dGold));
        document.querySelectorAll('.blob-dark').forEach(el => el.setAttribute('d', dDark));

        saveToLocalStorage();
    }

    function createEditor() {
        const svg = document.querySelector('.top-left svg');
        editorLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
        editorLayer.setAttribute('class', 'editor-layer');
        
        const lines = [
            { id: 'l1', p1: 'p0', p2: 'c1' },
            { id: 'l2', p1: 'p1', p2: 'c2' },
            { id: 'l3', p1: 'p1', p2: 'c3' },
            { id: 'l4', p1: 'p2', p2: 'c4' }
        ];

        lines.forEach(l => {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute('id', 'line-' + l.id);
            line.setAttribute('class', 'editor-line');
            editorLayer.appendChild(line);
        });

        Object.keys(curve).forEach(key => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute('id', 'pt-' + key);
            circle.setAttribute('r', key.startsWith('p') ? 6 : 5);
            circle.setAttribute('class', key.startsWith('p') ? 'editor-anchor' : 'editor-handle');
            
            let isDragging = false;
            circle.addEventListener('pointerdown', (e) => {
                isDragging = true;
                circle.setPointerCapture(e.pointerId);
            });
            circle.addEventListener('pointermove', (e) => {
                if (isDragging) {
                    const pt = svg.createSVGPoint();
                    pt.x = e.clientX;
                    pt.y = e.clientY;
                    const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse());
                    curve[key].x = cursorPt.x;
                    curve[key].y = cursorPt.y;

                    // Forzar simetría perfecta
                    if (key === 'p0') {
                        curve.p0.y = 0; // Mantener en el borde superior
                        curve.p2.x = 0;
                        curve.p2.y = curve.p0.x;
                    } else if (key === 'p2') {
                        curve.p2.x = 0; // Mantener en el borde izquierdo
                        curve.p0.y = 0;
                        curve.p0.x = curve.p2.y;
                    } else if (key === 'c1') {
                        curve.c4.x = curve.c1.y;
                        curve.c4.y = curve.c1.x;
                    } else if (key === 'c4') {
                        curve.c1.x = curve.c4.y;
                        curve.c1.y = curve.c4.x;
                    } else if (key === 'c2') {
                        curve.c3.x = curve.c2.y;
                        curve.c3.y = curve.c2.x;
                    } else if (key === 'c3') {
                        curve.c2.x = curve.c3.y;
                        curve.c2.y = curve.c3.x;
                    } else if (key === 'p1') {
                        // Proyectar sobre la diagonal y = x
                        const avg = (curve.p1.x + curve.p1.y) / 2;
                        curve.p1.x = avg;
                        curve.p1.y = avg;
                    }

                    renderEditor();
                    updatePaths();
                }
            });
            circle.addEventListener('pointerup', (e) => {
                isDragging = false;
                circle.releasePointerCapture(e.pointerId);
            });
            
            editorLayer.appendChild(circle);
        });
        
        svg.appendChild(editorLayer);
        renderEditor();
        document.body.classList.add('editing-mode');
        resetEditorBtn.style.display = 'block';
    }

    function renderEditor() {
        if (!editorLayer) return;
        
        const updateLine = (id, p1, p2) => {
            const line = document.getElementById('line-' + id);
            line.setAttribute('x1', curve[p1].x);
            line.setAttribute('y1', curve[p1].y);
            line.setAttribute('x2', curve[p2].x);
            line.setAttribute('y2', curve[p2].y);
        };
        
        updateLine('l1', 'p0', 'c1');
        updateLine('l2', 'p1', 'c2');
        updateLine('l3', 'p1', 'c3');
        updateLine('l4', 'p2', 'c4');

        Object.keys(curve).forEach(key => {
            const circle = document.getElementById('pt-' + key);
            circle.setAttribute('cx', curve[key].x);
            circle.setAttribute('cy', curve[key].y);
        });
    }

    function destroyEditor() {
        if (editorLayer) {
            editorLayer.remove();
            editorLayer = null;
        }
        document.body.classList.remove('editing-mode');
        resetEditorBtn.style.display = 'none';
    }

    toggleEditorBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        if (isEditing) {
            toggleEditorBtn.textContent = '✅ Terminar Edición';
            createEditor();
        } else {
            toggleEditorBtn.textContent = '✏️ Modo Editor de Esquinas';
            destroyEditor();
        }
    });

    resetEditorBtn.addEventListener('click', () => {
        Object.keys(originalCurve).forEach(key => {
            curve[key].x = originalCurve[key].x;
            curve[key].y = originalCurve[key].y;
        });
        if (isEditing) {
            renderEditor();
        }
        updatePaths();
    });

    const factoryResetBtn = document.getElementById('factoryResetBtn');
    if (factoryResetBtn) {
        factoryResetBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres borrar todos los datos y restablecer todo de fábrica? Esto no se puede deshacer.')) {
                localStorage.removeItem('invitationData');
                localStorage.removeItem('invitationCurve');
                location.reload();
            }
        });
    }

    const resetColorsBtn = document.getElementById('resetColorsBtn');
    if (resetColorsBtn) {
        resetColorsBtn.addEventListener('click', () => {
            inputs.mainColor.value = "#007a53";
            inputs.darkColor.value = "#003a26";
            inputs.goldColor.value = "#c49d47";
            updatePreview();
        });
    }

    // Cargar datos previos y luego inicializar vista
    loadFromLocalStorage();
    applyZoom();
    updatePreview();
    updatePaths();
});
