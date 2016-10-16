import angular from 'angular';

class instanceInfoChart {
  constructor() {
    'ngInject';

    this.restrict = 'E';
    this.controller = 'instanceInfoChartCtrl';
    this.controllerAs = 'instanceInfoChart';
    this.scope = {
      detailItems: '=',
      barColor: '@?'
    };

    this.link = (scope, element) => {

      scope.$watch('detailItems', newItems => {
        redraw(newItems);
      });

      function redraw(items) {
        const charWidth = 400;
        const minBarWidth = 10;
        const maxBarWidth = 350;
        const barHeight = 20;
        const textHeight = 20;
        const textPadding = 5;
        const chartOffset = 12;

        const maxValue = _.maxBy(items, 'count').count;
        const minValue = _.minBy(items, 'count').count;

        const svg = d3.select(element[0])
                      .append('svg')
                      .attr('width', charWidth)
                      .attr('height', (barHeight + textHeight) * items.length);

        const scale = d3.scaleLinear()
                        .domain([minValue, maxValue])
                        .range([minBarWidth, maxBarWidth]);

        svg.selectAll('rect')
           .data(items)
           .enter()
           .append('rect')
           .attr('x', 0)
           .attr('y', (d, i) => {
             return i * (barHeight + textHeight) + textHeight;
           })
           .attr('width', d => {
             return scale(d.count);
           })
           .attr('height', barHeight)
           .attr('fill', scope.barColor || '#000');

        svg.append('g')
           .selectAll('text')
           .data(items)
           .enter()
           .append('text')
           .text(d => {
             return numberWithCommas(d.count);
           })
           .attr('x', d => {
             return scale(d.count) + textPadding;
           })
           .attr('y', (d, i) => {
             return i * (barHeight + textHeight) + textHeight + barHeight / 2 + 2;
           });

        svg.append('g')
           .selectAll('text')
           .data(items)
           .enter()
           .append('text')
           .text(d => {
             return d.name;
           })
           .attr('x', 0)
           .attr('y', (d, i) => {
             return i * (barHeight + textHeight) + chartOffset;
           });
      }

      function numberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    };
  }
}

angular.module('OpenDataDiscovery').directive('instanceInfoChart', () => new instanceInfoChart());

export default instanceInfoChart;
