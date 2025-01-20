class Quincena{
  constructor(tasaDolar, fechaInicio, fechaFin, porcentajeGastos, porcentajeGustos, porcentajeAhorros){
    this.gastos = [];
    this.ingresos = [];
    this.tasaDolar = tasaDolar;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.porcentajeGastos = porcentajeGastos;
    this.porcentajeGustos = porcentajeGustos;
    this.porcentajeAhorros = porcentajeAhorros;
  }
}

export default Quincena;