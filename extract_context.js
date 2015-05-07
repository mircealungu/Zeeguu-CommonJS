/*
 This returns the first sentence in the paragraph that
 matches the required term. This is not perfect, but
 it is probably happening very rarely, that the user
 searches for a later occurrence of a word in a text
 than the first one!
 */

// TODO:
/*
 - more word separators
 - more EOF
 - remove i.e, e.g., No.
 */

//BEFORE Monday 20, April
//        var sentenceRegEx = /\(?[^\.!\?]+[\.!\?]\)?/g;
//AFTER Monday 20, April
//        var sentenceRegEx = (([^.!?]*)([\s,"»«]|^)+(term)(([.!?]|$)|(([\s,"»«:]|$)([^.!?]|$)*([.!?]|$))))


function extract_context (surrounding_paragraph, term) {
    surrounding_paragraph.children("script").remove(); /* Some websites, like derbund.ch have scripts inside paragraphs!!! */
    var paragraph_text =surrounding_paragraph.text();
    var context = "";
    try {
        var replacements = {
            "%EOS%" : "[.!?]|$",   // EOS -- End Of Sentence
            "%notEOS%" : "[^.!?]",
            "%TERM%": term,
            "%BOW%": "[\\s,\"»«]|^", // BOW - Beginning of Word
            "%EOW%":  "[\\s,\"»«:]|$"
        };

        var symbolic_regex = "((%notEOS%*)(%BOW%)+(%TERM%)((%EOS%)|((%EOW%)(%notEOS%|$)*(%EOS%))))";

        var substituted_regex = symbolic_regex.replace(/%\w+%/g, function (each_match) {
            return replacements[each_match] || each_match;
        });

        var sentenceRegEx =  new RegExp(substituted_regex, "gi");


        context = $.trim(paragraph_text.match(sentenceRegEx)[0]);
    } catch (e) {
    }
    return  context;
}

function getContext() {
    var selection = getSelectionPosition()

    var min = selection.selectionStart;
    var max = selection.selectionEnd;
    var text = selection.text;
    var inLoop;

    // Select context (to the left side)
    if (min != 0 && min != text.length) {
        var current = text.substring(min, min + 1);
        var next = text.substring(min - 1, min);

        inLoop = false;
        while (min != 0
                && !(current == "." || next == ".")
                && !(current == "}" || next == "}")
                // Check if the end of the paragraph is reached
                && !(((current == current.toUpperCase() && next == next.toLowerCase()) ||
                     (!isNaN(current) && isNaN(next) && next == next.toLowerCase()))
                     && !(!isNaN(current) && !isNaN(next))
                     && !(current == " " || next == " ")
                     && !(current == "," || next == ",")
                     && !(current == ":" || next == ":")
                     && !(current == "-" || next == "-")
                     && !(current == "'" || next == "'")
                     && !(current == "/" || next == "/")
                     && !(current == "\"" || next == "\"")
                     && !(current == "»" || next == "»")
                     && !(current == "«" || next == "«"))) {
            current = text.substring(min, min + 1);
            next = text.substring(min - 1, min);
            min -= 1;
            inLoop = true;
        }
        if (inLoop && min != 0)
            min += 1;
    }

    // Select context (to the right side)
    if (max != 0 && max != text.length) {
        var current = text.substring(max - 1, max);
        var next = text.substring(max, max + 1);

        inLoop = false;
        while (max != text.length
                && !(current == ".")
                // Check if the end of the paragraph is reached
                && !(((current == current.toLowerCase() && next == next.toUpperCase()) ||
                     (!isNaN(current) && isNaN(next) && next == next.toUpperCase()))
                     && !(!isNaN(current) && !isNaN(next))
                     && !(current == " " || next == " ")
                     && !(current == "," || next == ",")
                     && !(current == ":" || next == ":")
                     && !(current == "-" || next == "-")
                     && !(current == "'" || next == "'")
                     && !(current == "/" || next == "/")
                     && !(current == "\"" || next == "\"")
                     && !(current == "»" || next == "»")
                     && !(current == "«" || next == "«")
                     && !(next == "."))) {
            current = text.substring(max - 1, max);
            next = text.substring(max, max + 1);
            max += 1;
            inLoop = true;
        }
        if (inLoop && max != text.length)
            max -=1;
    }

    var context = text.substring(min,max).trim();

    // Debug information
    //console.log(context);

    return {
        "term": getExtendedSelection(),
        "context": context,
        "title": document.title,
        "url": document.URL
    };
}
