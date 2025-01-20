import Movimiento from "./Movimiento";

class Ingreso extends Movimiento{
  constructor(descripcion, cantidad, dolar, ingresoFijo, efectivo){
    super(descripcion,cantidad, dolar)
    this.ingresoFijo = ingresoFijo;
    this.efectivo = efectivo;
  }
}

export default Ingreso;