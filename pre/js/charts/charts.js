//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas2 } from '../helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage, setCustomCanvas, setChartCustomCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42', 
COLOR_ANAG_1 = '#D1834F', 
COLOR_ANAG_2 = '#BF2727', 
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0', 
COLOR_GREY_1 = '#B5ABA4', 
COLOR_GREY_2 = '#64605A', 
COLOR_OTHER_1 = '#B58753', 
COLOR_OTHER_2 = '#731854';

export function initChart(iframe) {
    //Lectura de datos
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_demografia_1_4/main/data/diferencias_hombres_mujeres_2021.csv', function(error,data) {
        if (error) throw error;

        let margin = {top: 10, right: 20, bottom: 40, left: 60},
            width = document.getElementById('chart').clientWidth - margin.left - margin.right,
            height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

        let svg = d3.select("#chart")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let x = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map(function(d) { return d.Edad; }))
            .padding(0.2);

        let xAxis = function(g){
            g.call(d3.axisBottom(x).tickValues(x.domain().filter(function(d,i){ return !(i%10)})));
            g.call(function(g){g.selectAll('text').attr("transform", "translate(-5,0)rotate(-30)").style("text-anchor", "end")});
        }
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        let y = d3.scaleLinear()
            .domain([0, 60000])
            .range([ height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        function init() {
            svg.selectAll("bars")
            .data(data)
            .enter()
            .append("rect")
            .attr('class', 'bars')
            .attr("x", function(d) { return x(d.Edad); })
            .attr("y", function(d) { return y(0); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(0); })
            .attr("fill", function(d) {
                if (d.grupo_sexo == 'hombres') {
                return COLOR_PRIMARY_1;
                } else {
                return COLOR_COMP_1;
                }
            })
            .transition()
            .delay(function(d,i){ return 25*i; })
            .duration(2000)     
            .attr("y", function(d) { return y(d.dif_grupo_2); })
            .attr("height", function(d) { return height - y(d.dif_grupo_2); });
        }

        function animateChart() {
            svg.selectAll(".bars")
                .attr("x", function(d) { return x(d.Edad); })
                .attr("y", function(d) { return y(0); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(0); })
                .transition()
                .delay(function(d,i){ return 25*i; })
                .duration(2000)     
                .attr("y", function(d) { return y(d.dif_grupo_2); })
                .attr("height", function(d) { return height - y(d.dif_grupo_2); });
        }

        /////
        /////
        // Resto - Chart
        /////
        /////
        init();

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateChart();
        });

        /////
        /////
        // Resto
        /////
        /////

        //Iframe
        setFixedIframeUrl('informe-perfil-mayores-2022-demografia_1_4','diferencia_poblacion_sexo');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('diferencia_poblacion_sexo');

        //Captura de pantalla de la visualización
        setChartCanvas();
        setCustomCanvas();

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('diferencia_poblacion_sexo');
            setChartCustomCanvasImage('diferencia_poblacion_sexo');
        });

        //Altura del frame
        setChartHeight(iframe);
    });
}