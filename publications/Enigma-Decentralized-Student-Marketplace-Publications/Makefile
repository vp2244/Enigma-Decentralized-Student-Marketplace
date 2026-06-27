PAPER=main

all: $(PAPER).pdf

$(PAPER).pdf: $(PAPER).tex */*.tex references/references.bib
	pdflatex -interaction=nonstopmode $(PAPER)
	bibtex $(PAPER)
	pdflatex -interaction=nonstopmode $(PAPER)
	pdflatex -interaction=nonstopmode $(PAPER)

clean:
	rm -f *.aux *.bbl *.blg *.log *.out */*.aux
