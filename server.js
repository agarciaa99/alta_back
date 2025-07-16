console.log("Iniciando servidor...");

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generar-contrato", (req, res) => {
  const datos = req.body;

  const plantillaPath = path.join(__dirname, "Template_Contratacion.docx");
  const contenido = fs.readFileSync(plantillaPath, "binary");

  const zip = new PizZip(contenido);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  doc.setData({
    NOMBRE_COMPLETO: `${datos.nombre} ${datos.apellidoPaterno} ${datos.apellidoMaterno}`,
    FECHA_INGRESO: datos.fechaIngreso,
    CALLE_Y_NUMERO: datos.calle,
    COLONIA: datos.colonia,
    MUNICIPIO: datos.delegacion,
    CIUDAD: datos.ciudad,
    CP: datos.cp,
    PUESTO: datos.puesto,
    DEPARTAMENTO: datos.departamento,
    NACIONALIDAD: datos.nacionalidad,
    ACTIVIDADES: datos.actividades,
    PERIODO_DE_CONTRATACION: datos.periodo,
    EDAD: datos.edad,
    SALARIO_DIARIO: datos.salarioDiario,
    TIPO_DE_ALTA: datos.alta,
  });

  try {
    doc.render();
  } catch (error) {
    console.error("Error al generar el contrato", error);
    return res.status(500).send("Error al generar el documento");
  }

  const buffer = doc.getZip().generate({ type: "nodebuffer" });

  res.setHeader("Content-Disposition", "attachment; filename=contrato.docx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.send(buffer);
});

const PORT = process.env.PORT || 3001;
app.get("/", (req, res) => {
  res.send("Backend activo 🚀");
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`)
);
