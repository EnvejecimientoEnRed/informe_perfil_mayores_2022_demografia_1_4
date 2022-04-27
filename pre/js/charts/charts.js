//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas3 } from '../helpers';
import { getInTooltip, getOutTooltip, positionTooltip } from '../modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C',
COLOR_COMP_1 = '#528FAD';
let tooltip = d3.select('#tooltip');

export function initChart() {
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
            svg.call(function(g){g.selectAll('.tick line').remove()});
        }
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        let y = d3.scaleLinear()
            .domain([0, 60000])
            .range([ height, 0]);

        let yAxis = function(svg) {
            svg.call(d3.axisLeft(y).ticks(6).tickFormat(function(d) { return numberWithCommas3(d); }));
            svg.call(function(g){
                g.selectAll('.tick line')
                    .attr('class', function(d,i) {
                        if (d == 0) {
                            return 'line-special';
                        }
                    })
                    .attr('x1', '0')
                    .attr('x2', `${width}`)
            });
        }

        svg.append("g")
            .call(yAxis);

        function init() {
            svg.selectAll("bars")
                .data(data)
                .enter()
                .append("rect")
                .attr('class', 'rect')
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
                .on('mouseover', function(d,i,e) {
                    //Opacidad de las barras
                    let bars = svg.selectAll('.rect');  
                    bars.each(function() {
                        this.style.opacity = '0.4';
                    });
                    this.style.opacity = '1';

                    //Texto
                    let html = '';
                    if(+d.Hombres > +d.Mujeres) {
                        html = '<p class="chart__tooltip--title">' + d.Edad + '</p>' + 
                        '<p class="chart__tooltip--text">A esta edad hay <b>' + numberWithCommas3(d.dif_grupo_2) + '</b> más hombres que mujeres</p>';
                    } else {
                        html = '<p class="chart__tooltip--title">' + d.Edad + '</p>' + 
                        '<p class="chart__tooltip--text">A esta edad hay <b>' + numberWithCommas3(d.dif_grupo_2) + '</b> más mujeres que hombres</p>';
                    }
            
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let bars = svg.selectAll('.rect');
                    bars.each(function() {
                        this.style.opacity = '1';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .delay(function(d,i){ return 25*i; })
                .duration(2000)     
                .attr("y", function(d) { return y(d.dif_grupo_2); })
                .attr("height", function(d) { return height - y(d.dif_grupo_2); });
        }

        function animateChart() {
            svg.selectAll(".rect")
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

            setTimeout(() => {
                setChartCanvas();
            }, 4000);
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
        setTimeout(() => {
            setChartCanvas();
        }, 4000);

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('diferencia_poblacion_sexo');
        });

        //Altura del frame
        setChartHeight();
    });
}