const fs 	= require('fs');
const path 	= require('path');
const exec 	= require('child_process').exec;
const cheerio = require('cheerio');

var htmlHeader = `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<!-- Custom css Only -->
		<meta charset="utf-8">
		<link rel="stylesheet" href="`+path.resolve(__dirname, 'pdf-form.css') +`">
	</head>
	<body>
`;

var htmlFooter = `
	</body>
	</html>
`;

var generatePdf = function(req, res){
	// Create pdf folder within server
	if (!fs.existsSync(path.resolve(__dirname, './pdf/')) ){
	    fs.mkdirSync(path.resolve(__dirname, './pdf/'));
	}

	// Reference file with formatted html
	var content = formatHtml(htmlHeader + req.body.html + htmlFooter),
		fileName = req.body.key,
		filePath = path.resolve(__dirname, './pdf/'+fileName);

	// Create or replace content
	if (!fs.existsSync(filePath+'.html')){
		fs.writeFileSync(filePath+'.html', content, { flag: 'wx' }, (err) => {
			if (err){
				console.log("creation", err);
				res.json({"code" : 500, "error" : "PDF source not translated"});
				return;
			}
		});
	}
	else{
		fs.writeFileSync(filePath+'.html', content);
	}

	// Cast html to pdf
	exec('wkhtmltopdf '+filePath+'.html '+filePath+'.pdf', (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			res.json({"code" : 500, "error" : "PDF not generated"});
			return;
		}
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);

		// Remove via unlink system call
		fs.unlink(filePath+'.html', (err) => {
			if (err){
				console.log(err);
				res.json({"code" : 500, "error" : "PDF source file not cleaned"});
				return;
			}
			res.json({"code" : 200, "file" : fileName+'.pdf'});
		});
	});
};

function formatHtml(htmlToFormat) {
	const $ = cheerio.load(htmlToFormat, {
		normalizeWhitespace: true
	});
	$('input').each(function(i, elem) {
		// For each etxt field, insert a new p tag, with a new line if required (80 char per line)
		if($(this).attr('type') === 'text') {
			var value = $(this).val();
			if(value.length === 0) {
				$(this).replaceWith('<p>'+value+'</p>');
			} else {
				var newValue = value.match(/.{80}/g).join('<br>');
				$(this).replaceWith('<p>'+newValue+'</p>');
			}
		}
	});
	return $.html();
}

var getPdf = function(req, res){
	if(req.params.file){
		var fileName = path.resolve(__dirname, './pdf/'+req.params.file);
		if (fs.existsSync(fileName)) {
			var file = fs.createReadStream(fileName);
			var stat = fs.statSync(fileName);
			res.setHeader('Content-Length', stat.size);
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', 'attachment; filename='+req.params.file);
			file.pipe(res).on('finish', function(){
				fs.unlink(fileName, (err) => {
					if (err){
						console.log(err);
					}
				});
			});
		}
		else{
			res.json({"code" : 404, "error" : "File not found"});
		}
	}
	else{
		res.json({"code" : 100, "error" : "File parameter not found"});
	}
};

module.exports.generate = generatePdf;
module.exports.get = getPdf;