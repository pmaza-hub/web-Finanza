"use strict";

/* =========================================
   CONFIGURACIÓN DE LA API
   ========================================= */

const UMA_API_URL =
    "https://hubfiscal.mx/api/v1/public/uma";


/* =========================================
   ORIENTACIÓN FINANCIERA
   ========================================= */

const orientationData = {
    persona: {
        category: "Finanzas personales",
        title: "Comienza organizando tus finanzas.",
        description:
            "Te ayudamos a entender tu situación financiera, definir objetivos y construir una estrategia adaptada a tus necesidades."
    },

    emprendedor: {
        category: "Finanzas para emprendedores",
        title: "Comienza fortaleciendo tu negocio.",
        description:
            "Analizamos las finanzas de tu emprendimiento para ayudarte a tener mayor control y tomar decisiones con información más clara."
    },

    mipyme: {
        category: "Finanzas para MiPyMEs",
        title: "Comienza con una visión financiera más clara.",
        description:
            "Identificamos oportunidades, riesgos y áreas de mejora para fortalecer la gestión financiera de tu empresa."
    }
};

const orientationOptions =
    document.querySelectorAll("[data-profile]");

const orientationResult =
    document.querySelector("#orientationResult");

const orientationResultAction =
    document.querySelector("#orientationResultAction");

const profileSelect =
    document.querySelector("#profile");

const orientationResultCategory =
    document.querySelector("#orientationResultCategory");

const orientationResultTitle =
    document.querySelector("#orientationResultTitle");

const orientationResultDescription =
    document.querySelector("#orientationResultDescription");


function updateOrientation(profile) {

    const selected = orientationData[profile];

    if (!selected || !orientationResult) {
        return;
    }

    orientationOptions.forEach((option) => {

        const active =
            option.dataset.profile === profile;

        option.classList.toggle(
            "is-selected",
            active
        );

        option.setAttribute(
            "aria-pressed",
            String(active)
        );
    });

    orientationResultCategory.textContent =
        selected.category;

    orientationResultTitle.textContent =
        selected.title;

    orientationResultDescription.textContent =
        selected.description;

    if (orientationResultAction) {
        orientationResultAction.dataset.profile =
            profile;
    }

    orientationResult.hidden = false;

    orientationResult.classList.remove(
        "finanza-orientation-result"
    );

    void orientationResult.offsetWidth;

    orientationResult.classList.add(
        "finanza-orientation-result"
    );
}


orientationOptions.forEach((option) => {

    option.addEventListener("click", () => {
        updateOrientation(
            option.dataset.profile
        );
    });

});


/* =========================================
   ANIMACIONES AL HACER SCROLL
   ========================================= */

const revealElements =
    document.querySelectorAll("[data-reveal]");

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


if (
    revealElements.length &&
    !prefersReducedMotion &&
    "IntersectionObserver" in window
) {

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "is-visible"
                    );

                    observer.unobserve(
                        entry.target
                    );
                });

            },
            {
                threshold: 0.15,
                rootMargin: "0px 0px -40px 0px"
            }
        );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

} else {

    revealElements.forEach((element) => {
        element.classList.add("is-visible");
    });

}


/* =========================================
   NAVBAR DINÁMICO
   ========================================= */

const mainNavbar =
    document.querySelector("#mainNavbar");

const navbarScrollThreshold = 20;


function updateNavbar() {

    if (!mainNavbar) {
        return;
    }

    mainNavbar.classList.toggle(
        "is-scrolled",
        window.scrollY > navbarScrollThreshold
    );
}


window.addEventListener(
    "scroll",
    updateNavbar,
    { passive: true }
);

updateNavbar();


/* =========================================
   VALIDACIÓN DEL FORMULARIO
   ========================================= */

const contactForm =
    document.querySelector("#contactForm");

const formSuccess =
    document.querySelector("#formSuccess");


if (contactForm && formSuccess) {

    contactForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            contactForm.classList.add(
                "was-validated"
            );

            if (!contactForm.checkValidity()) {
                return;
            }

            const submitButton =
                contactForm.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Solicitud preparada";
            }

            contactForm.hidden = true;
            formSuccess.hidden = false;

            formSuccess.focus();
        }
    );
}


/* =========================================
   ORIENTACIÓN → DIAGNÓSTICO
   ========================================= */

if (
    orientationResultAction &&
    profileSelect
) {

    orientationResultAction.addEventListener(
        "click",
        () => {

            const profile =
                orientationResultAction.dataset.profile;

            if (profile) {
                profileSelect.value = profile;
            }
        }
    );
}


/* =========================================
   API — INDICADOR UMA
   ========================================= */

const umaStatus =
    document.querySelector("#umaStatus");

const umaValue =
    document.querySelector("#umaValue");

const umaYear =
    document.querySelector("#umaYear");

const umaSalary =
    document.querySelector("#umaSalary");

const umaEmployeeRate =
    document.querySelector("#umaEmployeeRate");

const umaEmployerRate =
    document.querySelector("#umaEmployerRate");

const umaRefresh =
    document.querySelector("#umaRefresh");


function formatCurrency(value) {

    return new Intl.NumberFormat(
        "es-MX",
        {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2
        }
    ).format(value);
}


function formatPercentage(value) {

    return `${(
        Number(value) * 100
    ).toFixed(2)}%`;
}


function updateUMAStatus(
    message,
    state = ""
) {

    if (!umaStatus) {
        return;
    }

    umaStatus.textContent = message;

    umaStatus.classList.remove(
        "is-loading",
        "is-success",
        "is-error"
    );

    if (state) {
        umaStatus.classList.add(state);
    }
}


async function loadUMA() {

    if (
        !umaStatus ||
        !umaValue ||
        !umaYear ||
        !umaSalary ||
        !umaEmployeeRate ||
        !umaEmployerRate
    ) {
        return;
    }

    updateUMAStatus(
        "Consultando información...",
        "is-loading"
    );

    if (umaRefresh) {
        umaRefresh.disabled = true;
        umaRefresh.textContent =
            "Actualizando información...";
    }

    try {

        const response =
            await fetch(UMA_API_URL);

        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            typeof data.uma !== "number" ||
            typeof data.year !== "number"
        ) {
            throw new Error(
                "La respuesta de la API no tiene el formato esperado."
            );
        }

        umaValue.textContent =
            formatCurrency(data.uma);

        umaYear.textContent =
            `Vigente para ${data.year}`;

        umaSalary.textContent =
            formatCurrency(data.salarioMinimo);

        umaEmployeeRate.textContent =
            formatPercentage(data.employeeRate);

        umaEmployerRate.textContent =
            formatPercentage(data.employerRate);

        updateUMAStatus(
            "Información actualizada correctamente.",
            "is-success"
        );

    } catch (error) {

        console.error(
            "Error al consultar la API de UMA:",
            error
        );

        umaValue.textContent = "--";
        umaYear.textContent = "--";
        umaSalary.textContent = "--";
        umaEmployeeRate.textContent = "--";
        umaEmployerRate.textContent = "--";

        updateUMAStatus(
            "No fue posible consultar la información.",
            "is-error"
        );

    } finally {

        if (umaRefresh) {

            umaRefresh.disabled = false;

            umaRefresh.textContent =
                "Actualizar información";
        }
    }
}


if (umaRefresh) {

    umaRefresh.addEventListener(
        "click",
        loadUMA
    );
}


loadUMA();

/* =========================================
   API — HISTÓRICO TIPO DE CAMBIO FIX
   ========================================= */

const FX_API_URL =
    "https://hubfiscal.mx/api/v1/public/fx/history?days=7";

const fxStatus =
    document.querySelector("#fxStatus");

const fxValue =
    document.querySelector("#fxValue");

const fxDate =
    document.querySelector("#fxDate");

const fxSource =
    document.querySelector("#fxSource");

const fxChart =
    document.querySelector("#fxChart");

const fxMin =
    document.querySelector("#fxMin");

const fxMax =
    document.querySelector("#fxMax");

const fxChange =
    document.querySelector("#fxChange");

const fxRefresh =
    document.querySelector("#fxRefresh");


function formatExchangeRate(value) {

    return `$${Number(value).toFixed(4)}`;
}


function formatFXDate(dateString) {

    if (!dateString) {
        return "--";
    }

    const date =
        new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "es-MX",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function updateFXStatus(
    message,
    state = ""
) {

    if (!fxStatus) {
        return;
    }

    fxStatus.textContent = message;

    fxStatus.classList.remove(
        "is-loading",
        "is-success",
        "is-error"
    );

    if (state) {
        fxStatus.classList.add(state);
    }
}


function createFXBar(
    item,
    minimum,
    maximum,
    isCurrent
) {

    const bar =
        document.createElement("div");

    bar.className =
        "finanza-fx-bar";

    if (isCurrent) {
        bar.classList.add("is-current");
    }

    const range =
        maximum - minimum;

    const normalized =
        range === 0
            ? 60
            : 25 + (
                (item.rate - minimum) / range
            ) * 55;

    bar.style.height =
        `${normalized}%`;

    bar.title =
        `${formatFXDate(item.date)}: ${formatExchangeRate(item.rate)}`;

    bar.setAttribute(
        "aria-label",
        `${formatFXDate(item.date)}: ${formatExchangeRate(item.rate)}`
    );

    return bar;
}


async function loadFX() {

    if (
        !fxStatus ||
        !fxValue ||
        !fxDate ||
        !fxSource ||
        !fxChart ||
        !fxMin ||
        !fxMax ||
        !fxChange
    ) {
        return;
    }

    updateFXStatus(
        "Consultando histórico...",
        "is-loading"
    );

    fxChart.innerHTML = "";

    if (fxRefresh) {

        fxRefresh.disabled = true;

        fxRefresh.textContent =
            "Actualizando información...";
    }

    try {

        const response =
            await fetch(FX_API_URL);

        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            !Array.isArray(data) ||
            !data.length
        ) {
            throw new Error(
                "La API no devolvió un histórico válido."
            );
        }

        const history =
            data
                .filter(
                    item =>
                        item &&
                        item.date &&
                        typeof item.rate === "number"
                )
                .sort(
                    (a, b) =>
                        new Date(a.date) -
                        new Date(b.date)
                );

        if (!history.length) {
            throw new Error(
                "No existen registros válidos para mostrar."
            );
        }

        const rates =
            history.map(
                item => Number(item.rate)
            );

        const first =
            rates[0];

        const latest =
            rates[rates.length - 1];

        const minimum =
            Math.min(...rates);

        const maximum =
            Math.max(...rates);

        const change =
            first === 0
                ? 0
                : ((latest - first) / first) * 100;


        /* ==============================
           VALOR ACTUAL
           ============================== */

        fxValue.textContent =
            formatExchangeRate(latest);

        fxDate.textContent =
            `Último registro: ${formatFXDate(history.at(-1).date)}`;

        fxSource.textContent =
            history.at(-1).source || "Banxico";


        /* ==============================
           MÍNIMO / MÁXIMO
           ============================== */

        fxMin.textContent =
            formatExchangeRate(minimum);

        fxMax.textContent =
            formatExchangeRate(maximum);


        /* ==============================
           VARIACIÓN
           ============================== */

        const changeSign =
            change > 0
                ? "+"
                : "";

        fxChange.textContent =
            `${changeSign}${change.toFixed(2)}%`;

        fxChange.classList.remove(
            "is-positive",
            "is-negative"
        );

        if (change > 0) {
            fxChange.classList.add(
                "is-positive"
            );
        } else if (change < 0) {
            fxChange.classList.add(
                "is-negative"
            );
        }


        /* ==============================
           GRÁFICA
           ============================== */

        history.forEach(
            (item, index) => {

                const bar =
                    createFXBar(
                        item,
                        minimum,
                        maximum,
                        index === history.length - 1
                    );

                fxChart.appendChild(bar);
            }
        );


        updateFXStatus(
            `${history.length} registros consultados.`,
            "is-success"
        );

    } catch (error) {

        console.error(
            "Error al consultar el histórico FIX:",
            error
        );

        fxValue.textContent = "--";
        fxDate.textContent = "--";
        fxSource.textContent = "--";
        fxMin.textContent = "--";
        fxMax.textContent = "--";
        fxChange.textContent = "--";

        fxChart.innerHTML = `
            <div class="finanza-calendar-empty">
                No fue posible consultar el histórico del tipo de cambio.
            </div>
        `;

        updateFXStatus(
            "No fue posible consultar la información.",
            "is-error"
        );

    } finally {

        if (fxRefresh) {

            fxRefresh.disabled = false;

            fxRefresh.textContent =
                "Actualizar información";
        }
    }
}


if (fxRefresh) {

    fxRefresh.addEventListener(
        "click",
        loadFX
    );
}


loadFX();

/* =========================================
   API — INPC
   ========================================= */

const INPC_API_URL =
    "https://hubfiscal.mx/api/v1/public/inpc?limit=1";

const inpcStatus =
    document.querySelector("#inpcStatus");

const inpcValue =
    document.querySelector("#inpcValue");

const inpcPeriod =
    document.querySelector("#inpcPeriod");

const inpcSource =
    document.querySelector("#inpcSource");

const inpcRefresh =
    document.querySelector("#inpcRefresh");


function updateINPCStatus(
    message,
    state = ""
) {

    if (!inpcStatus) {
        return;
    }

    inpcStatus.textContent = message;

    inpcStatus.classList.remove(
        "is-loading",
        "is-success",
        "is-error"
    );

    if (state) {
        inpcStatus.classList.add(state);
    }
}


async function loadINPC() {

    if (
        !inpcStatus ||
        !inpcValue ||
        !inpcPeriod ||
        !inpcSource
    ) {
        return;
    }

    updateINPCStatus(
        "Consultando información...",
        "is-loading"
    );

    if (inpcRefresh) {

        inpcRefresh.disabled = true;

        inpcRefresh.textContent =
            "Actualizando información...";
    }

    try {

        const response =
            await fetch(INPC_API_URL);

        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }

        const data =
            await response.json();

        /*
         * La API puede entregar un periodo
         * como objeto o una serie como arreglo.
         */

        const currentData =
            Array.isArray(data)
                ? data[0]
                : data;

        if (
            !currentData ||
            currentData.value === undefined ||
            !currentData.period
        ) {
            throw new Error(
                "La respuesta de la API no tiene el formato esperado."
            );
        }

        inpcValue.textContent =
            Number(currentData.value).toFixed(2);

        inpcPeriod.textContent =
            `Periodo ${currentData.period}`;

        inpcSource.textContent =
            "INEGI";

        updateINPCStatus(
            "Información actualizada correctamente.",
            "is-success"
        );

    } catch (error) {

        console.error(
            "Error al consultar el INPC:",
            error
        );

        inpcValue.textContent = "--";
        inpcPeriod.textContent = "--";
        inpcSource.textContent = "--";

        updateINPCStatus(
            "No fue posible consultar la información.",
            "is-error"
        );

    } finally {

        if (inpcRefresh) {

            inpcRefresh.disabled = false;

            inpcRefresh.textContent =
                "Actualizar información";
        }
    }
}


if (inpcRefresh) {

    inpcRefresh.addEventListener(
        "click",
        loadINPC
    );
}


loadINPC();

/* =========================================
   API — CALENDARIO FISCAL
   ========================================= */

const CALENDAR_API_URL =
    "https://hubfiscal.mx/api/v1/public/calendario/proximos";

const calendarStatus =
    document.querySelector("#calendarStatus");

const calendarList =
    document.querySelector("#calendarList");

const calendarRefresh =
    document.querySelector("#calendarRefresh");


function updateCalendarStatus(
    message,
    state = ""
) {

    if (!calendarStatus) {
        return;
    }

    calendarStatus.textContent = message;

    calendarStatus.classList.remove(
        "is-loading",
        "is-success",
        "is-error"
    );

    if (state) {
        calendarStatus.classList.add(state);
    }
}


function formatCalendarDate(dateString) {

    if (!dateString) {
        return null;
    }

    const date =
        new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return {
        day: date.toLocaleDateString(
            "es-MX",
            { day: "2-digit" }
        ),

        month: date.toLocaleDateString(
            "es-MX",
            { month: "short" }
        )
    };
}


function createCalendarEvent(event) {

    const formattedDate =
        formatCalendarDate(event.date);

    if (
        !formattedDate ||
        !event.title
    ) {
        return null;
    }

    const article =
        document.createElement("article");

    article.className =
        "finanza-calendar-event";

    article.innerHTML = `
        <div class="finanza-calendar-date">

            <span class="finanza-calendar-date-day">
                ${formattedDate.day}
            </span>

            <span class="finanza-calendar-date-month">
                ${formattedDate.month}
            </span>

        </div>

        <div class="finanza-calendar-event-content">

            <span class="finanza-calendar-event-category">
                ${event.category || "Calendario fiscal"}
            </span>

            <h4 class="finanza-calendar-event-title">
                ${event.title}
            </h4>

            <p class="finanza-calendar-event-summary">
                ${event.summary || "Consulta la información disponible para este vencimiento fiscal."}
            </p>

        </div>

        <span
            class="finanza-calendar-event-arrow"
            aria-hidden="true"
        >
            →
        </span>
    `;

    return article;
}


async function loadFiscalCalendar() {

    if (
        !calendarStatus ||
        !calendarList
    ) {
        return;
    }

    updateCalendarStatus(
        "Consultando calendario fiscal...",
        "is-loading"
    );

    calendarList.innerHTML = "";

    if (calendarRefresh) {

        calendarRefresh.disabled = true;

        calendarRefresh.textContent =
            "Actualizando calendario...";
    }

    try {

        const response =
            await fetch(CALENDAR_API_URL);

        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "La respuesta de la API no tiene el formato esperado."
            );
        }

        const validEvents =
            data
                .map(createCalendarEvent)
                .filter(Boolean);

        if (!validEvents.length) {

            const emptyMessage =
                document.createElement("div");

            emptyMessage.className =
                "finanza-calendar-empty";

            emptyMessage.textContent =
                "No hay próximos vencimientos disponibles.";

            calendarList.appendChild(
                emptyMessage
            );

        } else {

            validEvents.forEach((eventElement) => {
                calendarList.appendChild(
                    eventElement
                );
            });
        }

        updateCalendarStatus(
            `${validEvents.length} vencimientos encontrados.`,
            "is-success"
        );

    } catch (error) {

        console.error(
            "Error al consultar el calendario fiscal:",
            error
        );

        const errorMessage =
            document.createElement("div");

        errorMessage.className =
            "finanza-calendar-empty";

        errorMessage.textContent =
            "No fue posible consultar el calendario fiscal.";

        calendarList.appendChild(
            errorMessage
        );

        updateCalendarStatus(
            "No fue posible consultar la información.",
            "is-error"
        );

    } finally {

        if (calendarRefresh) {

            calendarRefresh.disabled = false;

            calendarRefresh.textContent =
                "Actualizar calendario";
        }
    }
}


if (calendarRefresh) {

    calendarRefresh.addEventListener(
        "click",
        loadFiscalCalendar
    );
}


loadFiscalCalendar();

/* =========================================
   AÑO DEL FOOTER
   ========================================= */

const currentYear =
    document.querySelector("#currentYear");

if (currentYear) {
    currentYear.textContent =
        new Date().getFullYear();
}