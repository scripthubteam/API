const botModel = require("../models/bot");

/**
 * Esta clase obtiene datos de los bots.
 * @class
 */
class BotsManager {
  /**
   *
   * @param {String} bot Id del bot
   * @return {Promise} Retorna true o false si no hay errores, en caso de error
   * retorna el error
   */
  botExists(bot) {
    return new Promise(async (resolve, reject) => {
      const result = await botModel.exists({ botId: bot }).catch(err => {
        reject(err);
      });
      resolve(result);
    });
  }

  /**
   * Obtiene la posición de el bot en la queue
   * @param {String} bot Id de el bot
   * @return {Promise}
   */
  getPositionQueue(bot) {
    return new Promise(async (resolve, reject) => {
      const dbResult = await botModel.findOne({
        botId: bot
      });
      if (!dbResult) {
        reject(new Error(`No existe el bot ${bot} en la base de datos`));
      }

      resolve(dbResult.nQueue);
    });
  }

  /**
   * Obtiene el objeto de un bot
   * @param {String} bot Id del bot a obtener
   * @return {Promise} Al resolver retorna el bot
   */
  getBot(bot) {
    return new Promise(async (resolve, reject) => {
      try {
        const dbResult = await botModel.findOne({
          botId: bot
        });
        resolve(dbResult);
      } catch (err) {
        reject(new Error(err));
      }
    });
  }

  /**
   *
   * @return {Promise} Bots no aprovados
   */
  getNoApprovedBots() {
    return new Promise(async (resolve, reject) => {
      const dbResult = await botModel.find({ approvedDate: 0 }).catch(err => {
        reject(err);
      });
      resolve(dbResult);
    });
  }

  /**
   *
   * @param {String} bot Id del bot
   * @return {Promise} boolean
   */
  isApproved(bot) {
    return new Promise(async (resolve, reject) => {
      if (!(await this.botExists(bot))) {
        reject(new Error(`El bot ${bot} ya está en la base de datos`));
      }
      const dbResult = await botModel
        .findOne({
          botId: bot
        })
        .catch(err => {
          reject(new Error(err));
        });
      if (dbResult.approvedDate === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  }

  /**
   * Verifica si el bot está certificado
   * @param {String} bot id del bot
   * @return {Promise} Boolean
   */
  isCertified(bot) {
    return new Promise(async (resolve, reject) => {
      if (!(await this.botExists(bot))) {
        reject(new Error(`El bot ${bot} no existe`));
      }
      const botDb = await botModel.findOne({
        botId: bot
      });
      if (botDb.certified) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * @return {Number} retorna la queue
   */
  async getQueue() {
    const noApprovedBots = await this.getNoApprovedBots();
    return noApprovedBots.length;
  }

  /**
   * Obtiene la id del owner de un bot
   * @param {String} bot id del bot
   * @return {Promise} id del owner
   */
  getOwner(bot) {
    return new Promise(async (resolve, reject) => {
      if (!(await this.botExists(bot))) {
        reject(new Error(`El bot ${bot} no existe`));
      }
      const dbBot = await this.getBot(bot).catch(err => {
        reject(new Error(err));
      });
      resolve(dbBot.ownerId);
    });
  }

  /**
   * Obtiene los usuarios que votaron
   * @param {String} bot id del bot
   * @return {Promise} Cantidad de votos
   */
  getUsersVote(bot) {
    return new Promise(async (resolve, reject) => {
      if (!(await this.botExists(bot))) {
        reject(new Error(`El bot ${bot} no existe`));
      }
      const dbBot = await this.getBot(bot).catch(err => {
        reject(new Error(err));
      });
      resolve(dbBot.votes);
    });
  }
  /**
   * Obtiene los votos positivos
   * @param {String} bot id del bot
   * @return {Promise} Numero de votos positivos
   */
  getVotesUp(bot) {
    return new Promise(async (resolve, reject) => {
      if (!(await this.botExists(bot))) {
        reject(new Error(`El bot ${bot} no existe`));
      }

      const dbBot = await this.getBot(bot);
      resolve(dbBot.votes_plus);
    });
  }

  /**
   * Obtiene los votos negativos de un bot
   * @param {String} bot id del bot
   * @return {Promise} numero de votos negativos
   */
  getVotesDown(bot) {
    return new Promise(async (resolve, reject) => {
      if (!(await this.botExists(bot))) {
        reject(new Error(`El bot ${bot} no existe`));
      }

      const dbBot = await this.getBot(bot);
      resolve(dbBot.votes_negative);
    });
  }

  /**
   * Vota negativamente por un bot
   * @param {String} bot id del bot
   * @param {String} user id del usuario que votó
   * @return {Promise} Bot con el numero actual de votos
   */

  /**
   * obtiene la prefix de un bot
   * @param {String} bot
   * @return {Promise} prefix
   */
  getDescription(bot) {
    return new Promise(async (resolve, reject) => {
      if (!(await this.botExists(bot))) {
        reject(new Error(`El bot ${bot} no existe`));
      }

      const dbBot = await botModel.findOne({ botId: bot });

      resolve(dbBot.info);
    });
  }

  /**
   * obtiene el prefix de un bot
   * @param {String} bot
   * @return {Promise} prefix
   */
  getPrefix(bot) {
    return new Promise(async (resolve, reject) => {
      if (!(await this.botExists(bot))) {
        reject(new Error(`El bot ${bot} no existe`));
      }

      const dbBot = await botModel.findOne({ botId: bot });
      resolve(dbBot.prefix);
    });
  }
}

module.exports = BotsManager;
