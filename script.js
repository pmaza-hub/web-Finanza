"use strict";

/* =========================================
   CONFIGURACIÓN DE APIs
   ========================================= */

const API = {
    uma: "https://hubfiscal.mx/api/v1/public/uma",
    fxHistory:
        "https://hubfiscal.mx/api/v1/public/fx/history?days=7",
    inpc:
        "https://hubfiscal.mx/api/v1/public/inpc?limit=1",
    fiscalCalendar:
        "https://hubfiscal.mx/api/v1/public/calendario/proximos"
};


/* =========================================
   CONFIGURACIÓN — WEB3FORMS
   ========================================= */

const WEB3FORMS = {
    endpoint: "https://api.web3forms.com/submit",
    accessKey: "f9e85f92-fb41-4cbe-8f33-cf71058f3fc8",
    subject: "Nueva solicitud de diagnóstico — FINANZA"
};


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
    const selected =
        orientationData[profile];

    if (
        !selected ||
        !orientationResult
    ) {
        return;
    }

    orientationOptions.forEach((option) => {
        const isActive =
            option.dataset.profile === profile;

        option.classList.toggle(
            "is-selected",
            isActive
        );

        option.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });

    if (orientationResultCategory) {
        orientationResultCategory.textContent =
            selected.category;
    }

    if (orientationResultTitle) {
        orientationResultTitle.textContent =
            selected.title;
    }

    if (orientationResultDescription) {
        orientationResultDescription.textContent =
            selected.description;
    }

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
    option.addEventListener(
        "click",
        () => {
            updateOrientation(
                option.dataset.profile
            );
        }
    );
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
                rootMargin:
                    "0px 0px -40px 0px"
            }
        );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

} else {

    revealElements.forEach((element) => {
        element.classList.add(
            "is-visible"
        );
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
        window.scrollY >
            navbarScrollThreshold
    );
}


window.addEventListener(
    "scroll",
    updateNavbar,
    {
        passive: true
    }
);

updateNavbar();


/* =========================================
   FORMULARIO DE CONTACTO
   WEB3FORMS
   ========================================= */

const contactForm =
    document.querySelector("#contactForm");

const formSuccess =
    document.querySelector("#formSuccess");


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            contactForm.classList.add(
                "was-validated"
            );

            /* ==============================
               VALIDACIÓN
               ============================== */

            if (!contactForm.checkValidity()) {
                return;
            }


            /* ==============================
               BOTÓN DE ENVÍO
               ============================== */

            const submitButton =
                contactForm.querySelector(
                    'button[type="submit"]'
                );

            const originalButtonText =
                submitButton
                    ? submitButton.textContent.trim()
                    : "Solicitar diagnóstico";


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Enviando solicitud...";
            }


            /* ==============================
               ENVÍO A WEB3FORMS
               ============================== */

            try {

                const formData =
                    new FormData(contactForm);


                formData.set(
                    "access_key",
                    WEB3FORMS.accessKey
                );


                formData.set(
                    "subject",
                    WEB3FORMS.subject
                );


                formData.set(
                    "from_name",
                    "FINANZA"
                );


                const response =
                    await fetch(
                        WEB3FORMS.endpoint,
                        {
                            method: "POST",
                            body: formData,
                            headers: {
                                Accept:
                                    "application/json"
                            }
                        }
                    );


                let result = null;


                try {

                    result =
                        await response.json();

                } catch (jsonError) {

                    console.error(
                        "No fue posible interpretar la respuesta de Web3Forms:",
                        jsonError
                    );

                }


                if (
                    !response.ok ||
                    !result ||
                    result.success !== true
                ) {

                    throw new Error(
                        result?.message ||
                        `Error HTTP: ${response.status}`
                    );
                }


                /* ==============================
                   ENVÍO EXITOSO
                   ============================== */

                contactForm.reset();

                contactForm.classList.remove(
                    "was-validated"
                );


                contactForm.hidden = true;


                if (formSuccess) {

                    formSuccess.hidden = false;

                    formSuccess.focus();
                }


            } catch (error) {

                console.error(
                    "Error al enviar el formulario de contacto:",
                    error
                );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;
                }


                alert(
                    "No fue posible enviar tu solicitud. Por favor, inténtalo nuevamente."
                );
            }

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

            const selectedProfile =
                orientationResultAction.dataset.profile;


            if (selectedProfile) {

                profileSelect.value =
                    selectedProfile;
            }
        }
    );
}


/* =========================================
   UTILIDADES GENERALES
   ========================================= */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "es-MX",
        {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2
        }
    ).format(
        Number(value)
    );
}


function formatPercentage(value) {

    return `${
        (
            Number(value) * 100
        ).toFixed(2)
    }%`;
}


function formatExchangeRate(value) {

    return `$${Number(value).toFixed(4)}`;
}


function formatDate(
    dateString,
    options = {}
) {

    if (!dateString) {
        return "--";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;
    }


    return date.toLocaleDateString(
        "es-MX",
        options
    );
}


function setStatus(
    element,
    message,
    state = ""
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "is-loading",
        "is-success",
        "is-error"
    );


    if (state) {

        element.classList.add(
            state
        );
    }
}


/* =========================================
   API — UMA
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


    setStatus(
        umaStatus,
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
            await fetch(
                API.uma
            );


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }


        const data =
            await response.json();


        if (
            !data ||
            !Number.isFinite(
                Number(data.uma)
            ) ||
            !Number.isFinite(
                Number(data.year)
            ) ||
            !Number.isFinite(
                Number(data.salarioMinimo)
            ) ||
            !Number.isFinite(
                Number(data.employeeRate)
            ) ||
            !Number.isFinite(
                Number(data.employerRate)
            )
        ) {

            throw new Error(
                "La respuesta de la API no tiene el formato esperado."
            );
        }


        umaValue.textContent =
            formatCurrency(
                data.uma
            );


        umaYear.textContent =
            `Vigente para ${data.year}`;


        umaSalary.textContent =
            formatCurrency(
                data.salarioMinimo
            );


        umaEmployeeRate.textContent =
            formatPercentage(
                data.employeeRate
            );


        umaEmployerRate.textContent =
            formatPercentage(
                data.employerRate
            );


        setStatus(
            umaStatus,
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


        setStatus(
            umaStatus,
            "No fue posible consultar la información.",
            "is-error"
        );

    } finally {

        if (umaRefresh) {

            umaRefresh.disabled =
                false;

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
   API — HISTÓRICO FIX
   ========================================= */

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

        bar.classList.add(
            "is-current"
        );
    }


    const range =
        maximum - minimum;


    const normalized =
        range === 0
            ? 60
            : 25 +
              (
                  (
                      item.rate -
                      minimum
                  ) /
                  range
              ) *
              55;


    bar.style.height =
        `${normalized}%`;


    const label =
        `${formatDate(
            item.date,
            {
                day: "2-digit",
                month: "short"
            }
        )}: ${formatExchangeRate(
            item.rate
        )}`;


    bar.title = label;


    bar.setAttribute(
        "aria-label",
        label
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


    setStatus(
        fxStatus,
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
            await fetch(
                API.fxHistory
            );


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
                    (item) =>
                        item &&
                        item.date &&
                        Number.isFinite(
                            Number(item.rate)
                        )
                )
                .map(
                    (item) => ({
                        ...item,
                        rate:
                            Number(
                                item.rate
                            )
                    })
                )
                .sort(
                    (a, b) =>
                        new Date(
                            a.date
                        ) -
                        new Date(
                            b.date
                        )
                );


        if (!history.length) {

            throw new Error(
                "No existen registros válidos para mostrar."
            );
        }


        const rates =
            history.map(
                (item) =>
                    item.rate
            );


        const first =
            rates[0];


        const latest =
            rates[
                rates.length - 1
            ];


        const minimum =
            Math.min(
                ...rates
            );


        const maximum =
            Math.max(
                ...rates
            );


        const change =
            first === 0
                ? 0
                : (
                    (
                        latest -
                        first
                    ) /
                    first
                ) *
                100;


        const current =
            history[
                history.length - 1
            ];


        /* ==============================
           VALOR ACTUAL
           ============================== */

        fxValue.textContent =
            formatExchangeRate(
                latest
            );


        fxDate.textContent =
            `Último registro: ${formatDate(
                current.date,
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )}`;


        fxSource.textContent =
            current.source ||
            "Banxico";


        /* ==============================
           MÍNIMO
           ============================== */

        fxMin.textContent =
            formatExchangeRate(
                minimum
            );


        /* ==============================
           MÁXIMO
           ============================== */

        fxMax.textContent =
            formatExchangeRate(
                maximum
            );


        /* ==============================
           VARIACIÓN
           ============================== */

        fxChange.textContent =
            `${
                change > 0
                    ? "+"
                    : ""
            }${change.toFixed(2)}%`;


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

                fxChart.appendChild(
                    createFXBar(
                        item,
                        minimum,
                        maximum,
                        index ===
                            history.length - 1
                    )
                );
            }
        );


        setStatus(
            fxStatus,
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


        fxChart.innerHTML = "";


        const errorMessage =
            document.createElement(
                "div"
            );


        errorMessage.className =
            "finanza-calendar-empty";


        errorMessage.textContent =
            "No fue posible consultar el histórico del tipo de cambio.";


        fxChart.appendChild(
            errorMessage
        );


        setStatus(
            fxStatus,
            "No fue posible consultar la información.",
            "is-error"
        );

    } finally {

        if (fxRefresh) {

            fxRefresh.disabled =
                false;

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

const inpcStatus =
    document.querySelector(
        "#inpcStatus"
    );

const inpcValue =
    document.querySelector(
        "#inpcValue"
    );

const inpcPeriod =
    document.querySelector(
        "#inpcPeriod"
    );

const inpcSource =
    document.querySelector(
        "#inpcSource"
    );

const inpcRefresh =
    document.querySelector(
        "#inpcRefresh"
    );


async function loadINPC() {

    if (
        !inpcStatus ||
        !inpcValue ||
        !inpcPeriod ||
        !inpcSource
    ) {

        return;
    }


    setStatus(
        inpcStatus,
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
            await fetch(
                API.inpc
            );


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }


        const data =
            await response.json();


        const currentData =
            Array.isArray(data)
                ? data[0]
                : data;


        if (
            !currentData ||
            !Number.isFinite(
                Number(
                    currentData.value
                )
            ) ||
            !currentData.period
        ) {

            throw new Error(
                "La respuesta de la API no tiene el formato esperado."
            );
        }


        inpcValue.textContent =
            Number(
                currentData.value
            ).toFixed(2);


        inpcPeriod.textContent =
            `Periodo ${currentData.period}`;


        inpcSource.textContent =
            "INEGI";


        setStatus(
            inpcStatus,
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


        setStatus(
            inpcStatus,
            "No fue posible consultar la información.",
            "is-error"
        );

    } finally {

        if (inpcRefresh) {

            inpcRefresh.disabled =
                false;

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

const calendarStatus =
    document.querySelector(
        "#calendarStatus"
    );

const calendarList =
    document.querySelector(
        "#calendarList"
    );

const calendarRefresh =
    document.querySelector(
        "#calendarRefresh"
    );


function createCalendarTextElement(
    tagName,
    className,
    text
) {

    const element =
        document.createElement(
            tagName
        );


    element.className =
        className;


    element.textContent =
        text;


    return element;
}


function createCalendarEvent(event) {

    if (
        !event?.date ||
        !event?.title
    ) {

        return null;
    }


    const day =
        formatDate(
            event.date,
            {
                day: "2-digit"
            }
        );


    const month =
        formatDate(
            event.date,
            {
                month: "short"
            }
        );


    if (
        day === "--" ||
        month === "--"
    ) {

        return null;
    }


    const article =
        document.createElement(
            "article"
        );


    article.className =
        "finanza-calendar-event";


    /* ==============================
       FECHA
       ============================== */

    const dateWrapper =
        document.createElement(
            "div"
        );


    dateWrapper.className =
        "finanza-calendar-date";


    dateWrapper.appendChild(
        createCalendarTextElement(
            "span",
            "finanza-calendar-date-day",
            day
        )
    );


    dateWrapper.appendChild(
        createCalendarTextElement(
            "span",
            "finanza-calendar-date-month",
            month
        )
    );


    /* ==============================
       CONTENIDO
       ============================== */

    const content =
        document.createElement(
            "div"
        );


    content.className =
        "finanza-calendar-event-content";


    content.appendChild(
        createCalendarTextElement(
            "span",
            "finanza-calendar-event-category",
            event.category ||
                "Calendario fiscal"
        )
    );


    content.appendChild(
        createCalendarTextElement(
            "h4",
            "finanza-calendar-event-title",
            event.title
        )
    );


    content.appendChild(
        createCalendarTextElement(
            "p",
            "finanza-calendar-event-summary",
            event.summary ||
                "Consulta la información disponible para este vencimiento fiscal."
        )
    );


    /* ==============================
       FLECHA
       ============================== */

    const arrow =
        createCalendarTextElement(
            "span",
            "finanza-calendar-event-arrow",
            "→"
        );


    arrow.setAttribute(
        "aria-hidden",
        "true"
    );


    article.appendChild(
        dateWrapper
    );


    article.appendChild(
        content
    );


    article.appendChild(
        arrow
    );


    return article;
}


async function loadFiscalCalendar() {

    if (
        !calendarStatus ||
        !calendarList
    ) {

        return;
    }


    setStatus(
        calendarStatus,
        "Consultando calendario fiscal...",
        "is-loading"
    );


    calendarList.innerHTML = "";


    if (calendarRefresh) {

        calendarRefresh.disabled =
            true;

        calendarRefresh.textContent =
            "Actualizando calendario...";
    }


    try {

        const response =
            await fetch(
                API.fiscalCalendar
            );


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


        const events =
            data
                .map(
                    createCalendarEvent
                )
                .filter(
                    Boolean
                );


        if (!events.length) {

            const emptyMessage =
                createCalendarTextElement(
                    "div",
                    "finanza-calendar-empty",
                    "No hay próximos vencimientos disponibles."
                );


            calendarList.appendChild(
                emptyMessage
            );

        } else {

            events.forEach(
                (eventElement) => {

                    calendarList.appendChild(
                        eventElement
                    );
                }
            );
        }


        setStatus(
            calendarStatus,
            `${events.length} vencimientos encontrados.`,
            "is-success"
        );

    } catch (error) {

        console.error(
            "Error al consultar el calendario fiscal:",
            error
        );


        const errorMessage =
            createCalendarTextElement(
                "div",
                "finanza-calendar-empty",
                "No fue posible consultar el calendario fiscal."
            );


        calendarList.innerHTML = "";


        calendarList.appendChild(
            errorMessage
        );


        setStatus(
            calendarStatus,
            "No fue posible consultar la información.",
            "is-error"
        );

    } finally {

        if (calendarRefresh) {

            calendarRefresh.disabled =
                false;

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
    document.querySelector(
        "#currentYear"
    );


if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();
}
