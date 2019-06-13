
const express = require('express');
const path = require('path');
var fs = require('fs');

const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views',path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine','html');

app.use('/atividade',(req, res)=>{
    res.render('painel.html');
});
app.use('/atendente',(req, res)=>{
    res.render('atendente.html');
});
app.use('/',(req, res)=>{
    res.render('index.html');
});

var orderByClient = [];
var orderBySelect = [];

io.on('connection', socket =>{
    socket.emit('lastHistoricData',orderByClient);
    socket.emit('lastHistoricDataSelect', orderBySelect);
    
    console.log(`Protocol WebSocket open : ${socket.id}`);

    socket.on('relatorioAtendido', data=>{
        console.log(data);
        fs.appendFile(`atividades/${data.codigoProceso}.txt`, `\n -- RELATÓRIO :  ${data.string} \n`, function (err) {
            if (err) throw err;
            console.log(`${data.codigoProceso} Atualizado com sucesso! ( Relatório atualizado )`);
          });
    });

    socket.on('sendRedirect', dataCode =>{
        orderByClient.push(dataCode);
        console.log('Enviado para Client-side : ' + dataCode.lastNumber);
        socket.broadcast.emit('receivedCode',dataCode);
    });

    socket.on('removeSelecionado', dataSelecionado=>{
        console.log('Enviado para Client-side Atendente: ');
        socket.broadcast.emit('removeUser', dataSelecionado);
    });

    socket.on('sendUser', dataUser =>{
        orderBySelect.push(dataUser);
        console.log('Enviado para Client-side Atendente: ' + dataUser.userSelect);
        fs.appendFile(`atividades/${dataUser.userSelect}.txt`,'\n CRIADO EM : '+new Date()+
        ' POR Guinchê : '+dataUser.where +" \n",(err)=>{
            if(err) throw err;
            else console.log('Arquivo '+dataUser.userSelect+' criado com sucesso!')
        });
        socket.broadcast.emit('receivedUser', dataUser);
    });

});



server.listen(3000);
