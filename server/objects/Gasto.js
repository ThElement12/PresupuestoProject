import Movimiento from "./Movimiento";

class Gasto extends Movimiento{
  constructor(descripcion, cantidad, dolar, metodoPago, pagado){
    super(descripcion, cantidad, dolar);
    this.metodoPago = metodoPago;
    this.pagado = pagado;
  }
}

export default Gasto;