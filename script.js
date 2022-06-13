const scrollTop = document.querySelector(".to-top");
scrollTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    scrollTop.classList.add("active");
  } else {
    scrollTop.classList.remove("active");
  }
});

const theme = document.querySelector(".theme");
// Toggle Theme
theme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  let currentTheme = document.body.classList.value;
  if (document.body.classList.contains("dark")) {
    theme.children[0].setAttribute("name", "sunny");
  } else {
    theme.children[0].setAttribute("name", "moon");
  }
  // Save Theme
  localStorage.setItem("theme", currentTheme);
});

window.addEventListener("load", () => {
  // Restore Saved theme
  let currentTheme = localStorage.getItem("theme");
  document.body.classList = currentTheme;

  if (document.body.classList.contains("dark")) {
    theme.children[0].setAttribute("name", "sunny");
  } else {
    theme.children[0].setAttribute("name", "moon");
  }
});

// Toggle Filter dropdown
const dropdown = document.querySelector(".dropdown");
const dropdownContent = document.querySelector(".filter ul");
dropdown.addEventListener("click", () => {
  dropdownContent.classList.toggle("show-filter");
});
document.addEventListener("mouseup", (e) => {
  if (
    e.target != dropdownContent &&
    e.target.parentNode != dropdownContent &&
    e.target != dropdown &&
    e.target.parentNode != dropdown
  ) {
    dropdownContent.classList.remove("show-filter");
  }
});

const input = document.querySelector("input");
const countries = document.querySelector(".countries");
const borders = document.querySelector(".border-countries");
apiUrl = "https://restcountries.com/v3.1/all";

const loader = document.querySelector(".loader");
const load = () => {
  loader.classList.remove("finish");
};
const endLoad = () => {
  setTimeout(() => {
    loader.classList.add("finish");
  }, 300);
};

const main = document.querySelector("main");
const fetchData = () => {
  load();
  fetch(apiUrl)
    .then((resp) => {
      return resp.json();
    })
    .then((data) => {
      endLoad();
      data.forEach((e) => {
        let name = e.name.common;
        let population = e.population
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (population == 0) {
          population = "-";
        }
        let region = e.region;
        let capital = e.capital;
        if (!capital) {
          capital = "-";
        }
        let flag = e.flags.png;

        let country = document.createElement("section");
        country.classList = "country";
        country.innerHTML = `
          <img src="${flag}" alt="Flag of ${name}" />
          <div class="info">
            <h4>${name}</h4>
            <p>Population: <span>${population}</span></p>
            <p>Region: <span>${region}</span></p>
            <p>Capital: <span>${capital}</span></p>
          </div>
          `;
        countries.appendChild(country);
        search();
      });

      let countryCards = [...countries.children];
      countryCards.forEach((e) => {
        e.addEventListener("click", () => {
          load();
          main.style.display = "none";
          let selectedCountry = document.querySelector(".selected");
          selectedCountry.style.display = "block";
          let url = `https://restcountries.com/v3.1/name/${e.children[1].children[0].textContent}?fullText=true`;
          viewCountry(url);
        });
      });
    });
};

const search = () => {
  input.addEventListener("keyup", (e) => {
    let term = e.target.value.toLowerCase();
    let countries = document.querySelectorAll(".country");

    countries.forEach((country) => {
      let countryName = country.children[1].children[0].textContent;

      if (countryName.toLowerCase().indexOf(term) != -1) {
        country.style.display = "block";
      } else {
        country.style.display = "none";
      }
    });
  });
};

const filter = () => {
  const regions = document.querySelectorAll(".filter ul li");

  regions.forEach((e) => {
    e.addEventListener("click", () => {
      for (i = 0; i < regions.length; i++) {
        regions[i].classList.remove("current");
      }
      e.classList.add("current");

      let countries = document.querySelectorAll(".country");

      countries.forEach((country) => {
        let countryRegion =
          country.children[1].children[2].children[0].textContent;

        if (countryRegion == e.textContent) {
          country.style.display = "block";
        } else {
          country.style.display = "none";
        }
        if (e.textContent == "All") {
          country.style.display = "block";
        }
      });
    });
  });
};

fetchData();
filter();

const back = document.querySelector(".selected button");
back.addEventListener("click", () => {
  back.parentElement.style.display = "none";
  main.style.display = "block";
});

const viewCountry = (url) => {
  fetch(url)
    .then((resp) => {
      return resp.json();
    })
    .then((info) => {
      endLoad();
      let countryInfo = document.querySelector(".country-info");
      let x = info[0];
      let detailedLeft = countryInfo.children[1].children[1];

      countryInfo.children[0].src = x.flags.png;
      countryInfo.children[0].alt = `flag of ${x.name.common}`;
      countryInfo.children[1].children[0].textContent = x.name.common;
      {
        let nativeName = detailedLeft.children[0].children[0];
        nativeName.textContent = Object.values(x.name.nativeName)[0].common;
      }
      detailedLeft.children[1].children[0].textContent = x.population
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      detailedLeft.children[2].children[0].textContent = x.region;
      detailedLeft.children[3].children[0].textContent = x.subregion;
      detailedLeft.children[4].children[0].textContent = x.capital;

      let detailedRight = countryInfo.children[1].children[2];
      detailedRight.children[0].children[0].textContent = x.tld;
      {
        let currencies = x.currencies[Object.keys(x.currencies)[0]];
        let currencyName = currencies.name;
        detailedRight.children[1].children[0].textContent = currencyName;
      }
      {
        let languages = x.languages;
        document.querySelector(".languages").innerHTML =
          Object.values(languages).join(", ");
      }
      {
        if (x.borders) {
          x.borders.forEach((a) => {
            borders.innerHTML = "";
            let borderCountries = document.createElement("p");

            let borderCountryUrl = `https://restcountries.com/v3.1/alpha/${a}`;
            fetch(borderCountryUrl)
              .then((resp) => {
                return resp.json();
              })
              .then((borderCountry) => {
                borderCountries.textContent = borderCountry[0].name.common;
                borders.appendChild(borderCountries);

                {
                  borderCountries.addEventListener("click", () => {
                    let url = `https://restcountries.com/v3.1/name/${borderCountries.textContent}?fullText=true`;

                    viewCountry(url);
                  });
                }
              });
          });
        } else {
          borders.innerHTML = "-";
        }
      }
    });
};
