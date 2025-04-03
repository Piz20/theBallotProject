import * as d3 from 'd3';

// Données pour notre graphique
const data = [30, 80, 45, 60, 20, 90, 50]; // Nombres d'animaux
const labels = ['Chiens', 'Chats', 'Chiens', 'Chats', 'Chiens', 'Chats', 'Chiens']; // Types d'animaux

// Sélectionner le SVG
const svg = d3.select("svg")
    .attr("width", 500)
    .attr("height", 350);

// Ajout du titre du graphique
svg.append("text")
    .attr("x", 250)  // Position horizontale du texte
    .attr("y", 30)   // Position verticale du texte
    .attr("text-anchor", "middle")  // Centrer le texte
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text("Comparaison du nombre de Chiens et de Chats");

// Ajout des barres
const bars = svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 70 + 40) // Décalage des barres pour mieux les afficher
    .attr("y", d => 350 - d * 3)  // Position verticale des barres
    .attr("width", 50)   // Largeur des barres
    .attr("height", d => d * 3)  // Hauteur des barres
    .attr("fill", "teal");

// Ajout des libellés pour les barres (les nombres)
svg.selectAll("text.bar")
    .data(data)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 70 + 65)  // Position horizontale
    .attr("y", d => 350 - d * 3 - 5)   // Position verticale juste au-dessus des barres
    .attr("text-anchor", "middle")  // Centrer le texte
    .attr("font-size", "14px")
    .attr("fill", "black")
    .text(d => d);

// Ajouter les labels des animaux (Chiens/Chats)
svg.selectAll("text.label")
    .data(labels)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 70 + 65)  // Position horizontale
    .attr("y", 330)   // Position verticale sous les barres
    .attr("text-anchor", "middle")  // Centrer le texte
    .attr("font-size", "14px")
    .attr("fill", "black")
    .text(d => d);

// Ajouter un axe Y (les valeurs des nombres)
const yScale = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([350, 50]);

svg.append("g")
    .attr("transform", "translate(40, 0)")
    .call(d3.axisLeft(yScale));
