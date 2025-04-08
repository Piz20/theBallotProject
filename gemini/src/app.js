import * as d3 from 'd3';

// Fonction principale pour générer un graphique en fonction du prompt
function generateGraph() {
    const prompt = document.getElementById('prompt').value.toLowerCase();
    const svg = d3.select("svg");
    svg.selectAll("*").remove(); // Nettoyer l'ancien graphique

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    let data = [10, 20, 30, 40, 50, 60, 70]; // Exemple de données

    if (prompt.includes("histogramme")) {
        const color = prompt.includes("rouge") ? "red" : prompt.includes("bleu") ? "blue" : "gray";

        const x = d3.scaleBand()
            .domain(data.map((d, i) => i))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data)])
            .range([height, 0]);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => x(i))
            .attr("y", d => y(d))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d))
            .attr("fill", color);
    } else if (prompt.includes("camembert") || prompt.includes("pie chart")) {
        const color = d3.scaleOrdinal(["red", "blue", "green", "orange", "purple"]);
        const pie = d3.pie();
        const arc = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 2);
        const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

        g.selectAll("path")
            .data(pie(data))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i));
    }
}

window.generateGraph = generateGraph;
