# NextApp 

Questo folder contiene l'implementazione del backend per il progetto del corso di Ingegneria del Software 2. Per maggiori dettagli sull'architettura usata e sull'organizzazione di questo branch rimandiamo alla Wiki di questa repository. 

## How to demo

Tale folder è implementato come una monorepo, pertanto ogni modulo è un package separato dagli altri con le proprie dependency e i file per la sua gestione. Come strumento per la gestione di questo folder abbiamo utilizzato @microsoft/rush. Per poter compilare il progetto è quindi necessario avere rush sulla propria macchina:

```
npm install -g @microsoft/rush
```

Per testare il server in locale è necessario clonare la repository e accedere al folder ```backend```:

```
git clone 
cd nextapp/backend
```

A questo punto si possono installare le repository e fare il build:

```
rush update
rush build
```

Per inizializzare il server è sufficiente avviare il ```gateway```:

```
cd src/gateway
rushx dev
```

Per poter avviare il server è inoltre necessario fornire il valore di alcune environment variable elencate nel file ```.env.example``` all'interno del folder ```gateway```.

## Note

Qualora non si voglia installare rush globalmente sulla propria macchina, i seguenti comandi permettono di installarlo soltanto all'interno del folder ```backend``` e di avviare il server:

```
node common/scripts/install-run-rush.js change -v
node common/scripts/install-run-rush.js update --purge
node common/scripts/install-run-rush.js install
node common/scripts/install-run-rush.js rebuild --verbose

cd ./src/gateway
node ../../common/scripts/install-run-rushx.js dev
```