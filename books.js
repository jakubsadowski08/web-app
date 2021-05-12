var express = require('express');
var path = require('path');
var mysql = require('mysql');
var myConnection  = require('express-myconnection');

var app = express();
app.use(express.urlencoded());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var dbOptions = {
	host: 'localhost',
	user: 'express',
	password: 'password123',
	database: 'books',
	port: 3306
}
app.use(myConnection(mysql, dbOptions, 'pool'));
app.use(express.static('public'));

app.get('/', function(req, res){
	res.render('start');
});

app.get('/books', function(req, res){
	req.getConnection(function(error, conn){
		conn.query('SELECT * FROM books',function(err,rows){
			var bookList=rows;
			res.render('books',{
				bookList: bookList
			});

		});
	});
});

app.get('/add', function(req, res){
	res.render('add');
});

app.post('/add', function(req, res){
	var book={
		title: req.body.title,
		author: req.body.author,
		year: req.body.year,
		publisher: req.body.publisher,
		pages: req.body.pages
	}
	console.log(req.body);
	console.log(book);
	req.getConnection(function(error, conn){
		conn.query('INSERT INTO books SET ?',book,function(err,rows){
			if(err){
				var message='Wystąpił błąd';
			}else{
				var message='Dane zostały dodane';
			}
			res.render('add',{message:message});
		});
	});
});

app.get('/edit/(:id)', function(req, res){
	var idbook=req.params.id;
	req.getConnection(function(error, conn){
		conn.query('SELECT * FROM books WHERE id='+idbook,function(err,rows){
			res.render('edit',{
				id: idbook,
				title: rows[0].title,
				author: rows[0].author,
				year: rows[0].year,
				publisher: rows[0].publisher,
				pages: rows[0].pages,
			});
		});
	});
});
app.post('/edit/(:id)', function(req, res){
	var book={
		title: req.body.title,
		author: req.body.author,
		year: req.body.year,
		publisher: req.body.publisher,
		pages: req.body.pages
	};
	req.getConnection(function(error, conn){
		conn.query('UPDATE books SET ? WHERE id='+req.params.id,book,function(err,rows){
			if(err){
				var message='Wystąpił błąd';
			}else{
				var message='Dane zostały zmienione';
			}
			res.render('edit',{
				id: req.params.id,
				title: req.body.title,
				author: req.body.author,
				year: req.body.year,
				publisher: req.body.publisher,
				pages: req.body.pages,
				message:message
			});
		});
	});
});

app.get('/delete/(:id)', function(req, res){
	var idbook=req.params.id;
	res.render('delete',{idbook:idbook});
});

app.post('/delete/(:id)', function(req, res){

	var idbook=req.params.id;
	req.getConnection(function(error, conn){
		conn.query('DELETE FROM books WHERE id='+idbook,function(err,rows){
			if(err){
				var message='Wystąpił błąd';
			}else{
				var message='Dane zostały usunięte';
			}
			res.render('delete',{idbook:idbook,message:message});
		});
	});
});

app.listen(3000);