const Discord = require('discord.js');

exports.run = (client, message, args) => {
  var rawSharpRed = 0.5;
  var rawSharpOrange = 0.75;
  var rawSharpYellow = 1.00;
  var rawSharpGreen = 1.05;
  var rawSharpBlue = 1.20;
  var rawSharpWhite = 1.32;
  var rawSharpPurple = 1.39;
  var rawRangedSharpness = 1;

  var h = 5.2;
  var gs = 4.8;
  var hh = 4.2;
  var cb = 3.6;
  var sa = 3.5;
  var ls = 3.3;
  var ig = 3.1;
  var l = 2.3;
  var gl = 2.3;
  var hbg = 1.5;
  var sns = 1.4;
  var db = 1.4;
  var lbg = 1.3;
  var bow = 1.2;

  if(!args[0] == null || !args[0] == "" && !args[1] == null || !args[1] == "" && !args[2] == null || !args[2] == "" && !args[3] == null || !args[3] == "") {
    var sharpMult = 0;
    var rawBase = 0;

    if(args[2] == "rawred") {
      sharpMult = rawSharpRed;
    } else if(args[2] == "raworange") {
      sharpMult = rawSharpOrange;
    } else if(args[2] == "rawyellow") {
      sharpMult = rawSharpYellow;
    } else if(args[2] == "rawgreen") {
      sharpMult = rawSharpGreen;
    } else if(args[2] == "rawblue") {
      sharpMult = rawSharpBlue;
    } else if(args[2] == "rawwhite") {
      sharpMult = rawSharpWhite;
    } else if(args[2] == "rawpurple") {
      sharpMult = rawSharpPurple;
    } else if(args[2] == "none") {
      sharpMult = rawRangedSharpness;
    }

    if(args[1] == "hammer") {
      rawBase = h;
    } else if(args[1] == "greatsword") {
      rawBase = gs;
    } else if(args[1] == "huntinghorn") {
      rawBase = hh;
    } else if(args[1] == "chargeblade") {
      rawBase = cb;
    } else if(args[1] == "switchaxe") {
      rawBase = sa;
    } else if(args[1] == "longsword") {
      rawBase = ls;
    } else if(args[1] == "insectglaive") {
      rawBase = ig;
    } else if(args[1] == "lance") {
      rawBase = l;
    } else if(args[1] == "gunlance") {
      rawBase = gl;
    } else if(args[1] == "heavybowgun") {
      rawBase = hbg;
    } else if(args[1] == "swordandshield") {
      rawBase = sns;
    } else if(args[1] == "dualblades") {
      rawBase = db;
    } else if(args[1] == "lightbowgun") {
      rawBase = lbg;
    } else if(args[1] == "bow") {
      rawBase = bow;
    }

    var calculate = (args[0] / rawBase) * sharpMult * args[3];
    let rounded = Math.round(calculate);

    if(Number.isNaN(rounded)) {
      message.channel.send("Sorry meowster, I can't calculate that!");
    } else {
      message.channel.send("Your raw damage is " + "**" + rounded + "**" + " meowster!");
    }
  } else {
    message.channel.send("Sorry meowster, I can't calculate that! Use +calchelp if you are unsure of something!");
  }
};