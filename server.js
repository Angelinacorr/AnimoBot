const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Angelina2009.",
    database:"animobot"
});

db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("MYSQL CONECTADO");
    }
});

// Guardar emociones
app.post("/emociones",(req,res)=>{

    const {emocion,nota}=req.body;

    db.query(
        "INSERT INTO emociones(emocion,nota) VALUES (?,?)",
        [emocion,nota],
        (err,result)=>{

if(err){
    console.log(err);
    return res.status(500).json(err);
}

            res.json({
                mensaje:"Guardado"
            });

        }
    );

});

// Obtener emociones
app.get("/emociones",(req,res)=>{

    db.query(
        "SELECT * FROM emociones ORDER BY fecha DESC",
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);

        }
    );

});

// Eliminar emoción
app.delete("/emociones/:id",(req,res)=>{

    db.query(
        "DELETE FROM emociones WHERE id=?",
        [req.params.id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                mensaje:"Eliminado"
            });

        }
    );

});

// Guardar recordatorio
app.post("/recordatorios",(req,res)=>{

    const {texto}=req.body;

    db.query(
        "INSERT INTO recordatorios(texto) VALUES(?)",
        [texto],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                mensaje:"Guardado"
            });

        }
    );

});
// Obtener recordatorios
app.get("/recordatorios",(req,res)=>{

    db.query(
        "SELECT * FROM recordatorios ORDER BY fecha DESC",
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);

        }
    );

});

// Marcar completado
app.put("/recordatorios/:id",(req,res)=>{

    const {completado}=req.body;

    db.query(
        "UPDATE recordatorios SET completado=? WHERE id=?",
        [completado,req.params.id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                mensaje:"Actualizado"
            });

        }
    );

});

// Eliminar recordatorio
app.delete("/recordatorios/:id",(req,res)=>{

    db.query(
        "DELETE FROM recordatorios WHERE id=?",
        [req.params.id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                mensaje:"Eliminado"
            });

        }
    );

});

// Iniciar el servidor
app.listen(3000,()=>{
    console.log("Servidor ejecutándose");
});