import 'dotenv/config';
import fs from 'node:fs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { RodiumAI } from 'rodiumai';

const apiKey = process.env.RODIUMAI_API_KEY;

if (!apiKey || apiKey === 'rd_sk_votre_cle') {
  console.error("Erreur : La variable RODIUMAI_API_KEY n'est pas definie ou contient la valeur d'exemple.");
  console.error("Veuillez renseigner votre cle dans le fichier .env ou dans votre environnement.");
  process.exit(1);
}

const client = new RodiumAI({
  apiKey: apiKey,
  defaultModel: 'anthropic/claude-haiku-4-5-20251001'
});

async function step1Chat(rl) {
  console.log('\n=== Etape 1 : Chat ===');
  let question = await rl.question('Votre question : ');
  question = question.trim();
  if (!question) {
    question = 'Dis-moi a quoi sert le mecanisme CORS en deux phrases.';
  }

  try {
    const response = await client.chat(question);
    const content = response.choices?.[0]?.message?.content || '';
    const cost = response.cost_rodi ?? 'N/A';

    console.log('\n[Reponse du modele]');
    console.log(content);
    console.log(`\nCout : ${cost} RODI\n`);
    return true;
  } catch (error) {
    console.error(`\n[Erreur SDK Chat] ${error.message || error}\n`);
    return false;
  }
}

async function step2Image(rl) {
  console.log('\n=== Etape 2 : Image ===');
  let description = await rl.question("Decrivez l'image : ");
  description = description.trim();
  if (!description) {
    description = 'A clean vector illustration representing cross-origin web requests and browser security';
  }

  try {
    console.log("Generation de l'image en cours via le SDK JavaScript...");
    const response = await client.images({
      model: 'google/gemini-3.1-flash-image',
      prompt: description,
      size: '1024x1024',
      n: 1
    });

    const first = response.data?.[0];
    if (first?.b64_json) {
      const buffer = Buffer.from(first.b64_json, 'base64');
      fs.writeFileSync('image.png', buffer);
      console.log('Image enregistree : image.png\n');
      return true;
    } else if (first?.url) {
      const fetchResp = await fetch(first.url);
      const arrayBuffer = await fetchResp.arrayBuffer();
      fs.writeFileSync('image.png', Buffer.from(arrayBuffer));
      console.log('Image enregistree : image.png\n');
      return true;
    }

    console.warn("[Avertissement] Aucune donnee d'image trouvee dans la reponse SDK.\n");
    return false;
  } catch (error) {
    console.error(`\n[Erreur SDK Image] ${error.message || error}\n`);
    return false;
  }
}

async function step3Video(rl) {
  console.log('\n=== Etape 3 : Video ===');
  let description = await rl.question('Decrivez la video : ');
  description = description.trim();
  if (!description) {
    description = 'Abstract animation showing data packets traveling safely across a web network';
  }

  try {
    console.log('Generation de la video en cours via le SDK JavaScript (timeout limite a 150s)...');
    const response = await client.videos({
      model: 'google/veo-3.1-generate-preview',
      prompt: description,
      duration_seconds: 4,
      timeout: 150_000
    });

    const first = response.data?.[0];
    if (first?.b64_json) {
      const buffer = Buffer.from(first.b64_json, 'base64');
      fs.writeFileSync('video.mp4', buffer);
      console.log('Video enregistree : video.mp4\n');
      return true;
    } else if (first?.url) {
      const fetchResp = await fetch(first.url);
      const arrayBuffer = await fetchResp.arrayBuffer();
      fs.writeFileSync('video.mp4', Buffer.from(arrayBuffer));
      console.log('Video enregistree : video.mp4\n');
      return true;
    }

    console.warn('[Avertissement] Aucune donnee de video trouvee dans la reponse SDK.\n');
    return false;
  } catch (error) {
    console.error(`\n[Erreur SDK Video] ${error.message || error}\n`);
    return false;
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });
  let currentStep = 1;

  try {
    while (true) {
      if (currentStep === 1) {
        await step1Chat(rl);
        while (true) {
          const choice = (await rl.question('Rester sur cette etape (r) ou passer a la suivante (s) ? ')).trim().toLowerCase();
          if (choice === 'r') {
            break;
          } else if (choice === 's') {
            currentStep = 2;
            break;
          } else {
            console.log("Choix invalide. Veuillez entrer 'r' ou 's'.");
          }
        }
      } else if (currentStep === 2) {
        await step2Image(rl);
        while (true) {
          const choice = (await rl.question('Revenir en arriere (b), rester (r) ou passer a la suivante (s) ? ')).trim().toLowerCase();
          if (choice === 'b') {
            currentStep = 1;
            break;
          } else if (choice === 'r') {
            break;
          } else if (choice === 's') {
            currentStep = 3;
            break;
          } else {
            console.log("Choix invalide. Veuillez entrer 'b', 'r' ou 's'.");
          }
        }
      } else if (currentStep === 3) {
        await step3Video(rl);
        while (true) {
          const choice = (await rl.question('Revenir en arriere (b), rester (r) ou quitter (q) ? ')).trim().toLowerCase();
          if (choice === 'b') {
            currentStep = 2;
            break;
          } else if (choice === 'r') {
            break;
          } else if (choice === 'q') {
            console.log('\nFin du programme. A bientot !');
            return;
          } else {
            console.log("Choix invalide. Veuillez entrer 'b', 'r' ou 'q'.");
          }
        }
      }
    }
  } finally {
    rl.close();
  }
}

main().catch(err => {
  console.error('[Erreur execution]', err);
});
