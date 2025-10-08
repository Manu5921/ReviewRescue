# 🚀 Quick Start - Mobile GitHub Actions

## 📱 Copie-Colle pour Issue Mobile

**1. Ouvre GitHub App** → Issues → New Issue

**2. Copie ce texte** :

```
## 🎯 Objective
Implement MVP - User Story 1: View All Google Reviews

## 📋 Task Range
Task range: T001-T068

## 📦 Deliverable
Complete MVP with authentication, review syncing, and display UI

## 📝 Notes
- Setup + Foundation + US1 Implementation
- ~3-4 hours execution time
- Creates production-ready Chrome extension
```

**3. Ajoute le label** : `run-claude`

**4. Submit** ✅

---

## ⏱️ Timeline Attendu

- **0-5 min** : Workflow démarre, clone repo
- **5-10 min** : Installation dépendances, setup
- **10-180 min** : Implémentation des 68 tâches
- **180-240 min** : Validation, tests, PR création

**Total** : ~3-4 heures

---

## 📊 Monitoring depuis Mobile

### Via GitHub App
1. **Actions** tab
2. **Claude Max Implementation** workflow
3. Tap sur le run en cours
4. **Jobs** → Voir les steps

### Via Notifications
- GitHub envoie une notification quand :
  - ✅ Workflow démarre
  - ✅ PR est créée
  - ❌ Workflow échoue (avec logs)

---

## 🔍 Vérifier le Résultat

Quand le workflow est terminé :

1. **Pull Requests** tab
2. Nouvelle PR automatique
3. **Files changed** → Review le code
4. **Checks** → Vérifier le build (si CI)
5. **Merge** si tout est OK

---

## 🆘 Debugging

### Workflow échoue au parsing
**Erreur** : `No task range found in issue body`

**Fix** : L'issue doit contenir exactement :
```
Task range: T001-T068
```

### Workflow n'a pas démarré
**Check** :
1. Label `run-claude` est bien ajouté
2. Secret `CLAUDE_CODE_OAUTH_TOKEN` existe
3. Workflow est sur la branche correcte

**Commande Mac** :
```bash
gh secret list --repo Manu5921/ReviewRescue
gh label list --repo Manu5921/ReviewRescue | grep run-claude
```

### Voir les logs détaillés
**Via Mac** :
```bash
gh run list --repo Manu5921/ReviewRescue
gh run view <run-id> --log
```

**Via Mobile** :
GitHub App → Actions → Run → Jobs → Expand steps

---

## 📋 Autres Task Ranges

### Par Phase

| Phase | Tasks | Description | Temps |
|-------|-------|-------------|-------|
| Setup | T001-T011 | Structure projet | 30 min |
| Foundation | T012-T036 | Infrastructure core | 1-2h |
| US1 (MVP) | T037-T068 | View Reviews | 2-3h |
| **MVP Complet** | **T001-T068** | **Setup + Foundation + US1** | **3-4h** |

### Par User Story

| Story | Priority | Tasks | Description | Temps |
|-------|----------|-------|-------------|-------|
| US1 | P1 (MVP) | T001-T068 | View Reviews | 3-4h |
| US4 | P2 | T069-T089 | Search/Filter | 1-2h |
| US2 | P2 | T090-T133 | Export CSV/JSON/PDF | 2-3h |
| US3 | P3 | T134-T186 | AI Insights | 3-4h |
| Polish | Final | T187-T227 | Production ready | 2-3h |

### Delivery Incrémentale

1. **v0.1 MVP** : `T001-T068` (3-4h)
2. **v0.2** : `T069-T089` (+1-2h) = Search
3. **v0.3** : `T090-T133` (+2-3h) = Export
4. **v0.4** : `T134-T186` (+3-4h) = AI Insights
5. **v1.0** : `T187-T227` (+2-3h) = Production

**Total v1.0** : ~15 heures d'exécution cloud

---

## 💡 Tips

### Exécution Parallèle
Tu peux créer plusieurs issues simultanément :
- Issue 1 : `T001-T036` (Foundation)
- Issue 2 : `T069-T089` (US4) - peut démarrer après US1
- Issue 3 : `T090-T133` (US2) - peut démarrer après US1

GitHub Actions les exécutera en parallèle (limité par quota runner)

### Tester Rapidement
Pour tester le workflow sans tout implémenter :
```
Task range: T001-T003
```
Temps : ~5 minutes

### Reprendre après Échec
Si le workflow échoue à T045 :
```
Task range: T045-T068
```
Continue depuis la tâche qui a échoué

---

## ✅ Checklist Avant de Lancer

- [ ] Secret `CLAUDE_CODE_OAUTH_TOKEN` configuré
- [ ] Label `run-claude` existe
- [ ] Workflow `claude-max-implementation.yml` pushed
- [ ] Branch avec tasks.md existe
- [ ] Format issue correct : `Task range: T001-T068`

**Tout est prêt !** 🚀 Crée l'issue depuis ton mobile.
